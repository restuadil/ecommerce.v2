import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { Meta, PaginationResponse } from "src/types/web.type";

import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { QueryCategoryDto } from "./dto/query-category.dto";
import { ResponseCategoryDto } from "./dto/response-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<ResponseCategoryDto> {
    this.logger.info(`Creating new category with name: ${createCategoryDto.name}`);

    const { name, slug } = createCategoryDto;

    const existing = await this.categoriesRepository.findOneByNameOrSlug(name, slug);
    if (existing) throw new ConflictException("Category already exists");

    const category = await this.categoriesRepository.create({ name, slug });

    await this.redisService.deleteByPattern("categories*");

    return category;
  }

  async findOneById(id: string): Promise<ResponseCategoryDto> {
    this.logger.info(`Finding category by id: ${id}`);

    const category = await this.categoriesRepository.findOneById(id);
    if (!category) throw new NotFoundException("Category not found");

    return category;
  }

  async findManyByIds(ids: string[]): Promise<ResponseCategoryDto[]> {
    this.logger.info(`Finding categories by ids: ${ids.join(", ")}`);

    const categories = await this.categoriesRepository.findManyByIds(ids);
    if (!categories || categories.length !== ids.length)
      throw new NotFoundException("Some categories not found");

    return categories;
  }

  async findAll(
    queryCategoryDto: QueryCategoryDto,
  ): Promise<PaginationResponse<ResponseCategoryDto>> {
    this.logger.info(`Finding all categories with query: ${JSON.stringify(queryCategoryDto)}`);

    const { page, limit } = queryCategoryDto;

    const cacheKey = `categoris:${JSON.stringify(queryCategoryDto)}`;
    const cached = await this.redisService.get<PaginationResponse<ResponseCategoryDto>>(cacheKey);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.categoriesRepository.findAll(queryCategoryDto),
      this.categoriesRepository.count(queryCategoryDto),
    ]);

    const meta: Meta = generateMeta(page, limit, total);

    await this.redisService.set(cacheKey, { data, meta });
    return { data, meta };
  }
}
