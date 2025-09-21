import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";
import { UserPayload } from "src/types/jwt.type";

import { ProductsRepository } from "./products.repository";
import { BrandsService } from "../brands/brands.service";
import { CategoriesService } from "../categories/categories.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { ResponseProductDto, toResponseProductDto } from "./dto/response-product.dto";
import { StoresService } from "../stores/stores.service";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly productsRepository: ProductsRepository,
    private readonly redisService: RedisService,
    private readonly brandsService: BrandsService,
    private readonly categoriesService: CategoriesService,
    private readonly storesService: StoresService,
  ) {}

  async create(me: UserPayload, createProducDto: CreateProductDto): Promise<ResponseProductDto> {
    this.logger.info(`Creating new product with name: ${createProducDto.name}`);

    const { brandId, categoryIds, name, slug } = createProducDto;
    const { id } = me;
    await this.brandsService.findOneById(brandId);
    await this.categoriesService.findManyByIds(categoryIds);
    const store = await this.storesService.getStoreByStoreAmdinId(id);
    const existing = await this.productsRepository.findOneByNameOrSlugInStore(store.id, name, slug);
    if (existing) throw new ConflictException("Product already exists");

    const product = await this.productsRepository.create(store.id, {
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
}
