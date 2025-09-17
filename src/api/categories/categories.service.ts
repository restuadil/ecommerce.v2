import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";

import { CategoriesRepository } from "./categories.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
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
}
