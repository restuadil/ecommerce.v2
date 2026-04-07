import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { UserPayload } from "src/types/jwt.type";
import { Meta, PaginationResponse } from "src/types/web.type";

import { ProductsRepository } from "./products.repository";
import { BrandsService } from "../brands/brands.service";
import { CategoriesService } from "../categories/categories.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { QueryProductDto } from "./dto/query.product.dto";
import { ResponseProductDto, toResponseProductDto } from "./dto/response-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly productsRepository: ProductsRepository,
    private readonly redisService: RedisService,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async create(me: UserPayload, createProducDto: CreateProductDto): Promise<ResponseProductDto> {
    this.logger.info(`Creating new product with name: ${createProducDto.name}`);

    const { brandId, categoryIds, name, slug } = createProducDto;
    const { id } = me;
    await this.brandsService.findOneById(brandId);
    await this.categoriesService.findManyByIds(categoryIds);
    const { storeId } = await this.usersService.getOneById(id);
    if (!storeId) throw new NotFoundException("Store not found");
    const existing = await this.productsRepository.findOneByNameOrSlugInStore(storeId, name, slug);
    if (existing) throw new ConflictException("Product already exists");

    const product = await this.productsRepository.create(storeId, {
      ...createProducDto,
    });

    await this.redisService.deleteByPattern("products*");

    return product;
  }

  async getOneById(id: string): Promise<ResponseProductDto> {
    const result = await this.productsRepository.findOneById(id);
    if (!result) throw new NotFoundException("Product not found");
    return toResponseProductDto(result);
  }

  async getAllProducts(
    queryProductDto: QueryProductDto,
  ): Promise<PaginationResponse<ResponseProductDto>> {
    this.logger.info(`Getting all products`);
    const { page, limit } = queryProductDto;

    const cacheKey = `products:${JSON.stringify(queryProductDto)}`;
    const cached = await this.redisService.get<PaginationResponse<ResponseProductDto>>(cacheKey);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.productsRepository.findAll(queryProductDto),
      this.productsRepository.count(queryProductDto),
    ]);

    const meta: Meta = generateMeta(page, limit, total);

    await this.redisService.set(cacheKey, { data, meta });

    return {
      data: data.map((product) => toResponseProductDto(product)),
      meta,
    };
  }

  async update(me: UserPayload, id: string, data: UpdateProductDto): Promise<ResponseProductDto> {
    const { storeId } = await this.usersService.getOneById(me.id);
    if (!storeId) throw new NotFoundException("Store not found");
    const product = await this.productsRepository.findOneByIdAndStoreId(id, storeId);
    if (!product) throw new NotFoundException("Product not found");

    const existing = await this.productsRepository.findOneByNameOrSlugInStore(
      storeId,
      data.name ?? product.name,
      data.slug ?? product.slug,
    );
    if (existing && existing.id !== id) throw new ConflictException("Product already exists");
    const updated = await this.productsRepository.update(id, data);

    await this.redisService.deleteByPattern("products*");

    return toResponseProductDto(updated);
  }

  async delete(me: UserPayload, id: string): Promise<void> {
    const { storeId } = await this.usersService.getOneById(me.id);
    if (!storeId) throw new NotFoundException("Store not found");
    const product = await this.productsRepository.findOneByIdAndStoreId(id, storeId);
    if (!product) throw new NotFoundException("Product not found");

    await this.productsRepository.delete(id);

    await this.redisService.deleteByPattern("products*");
  }
}
