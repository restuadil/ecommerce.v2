import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { Meta, PaginationResponse } from "src/types/web.type";

import { BrandsRepository } from "./brands.repository";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { QueryBrandDto } from "./dto/query-brand.dto";
import { ResponseBrandDto } from "./dto/response-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@Injectable()
export class BrandsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly brandsRepository: BrandsRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<ResponseBrandDto> {
    this.logger.info(`Creating new brand: ${createBrandDto.name}`);

    const { name, logo } = createBrandDto;

    const existing = await this.brandsRepository.findOneByName(name);
    if (existing) throw new ConflictException("Brand with this name already exists");

    const brand = await this.brandsRepository.create({ name, logo });

    await this.redisService.deleteByPattern("brands*");

    return brand;
  }

  async findOneById(id: string): Promise<ResponseBrandDto> {
    const brand = await this.brandsRepository.findOneById(id);
    if (!brand) throw new NotFoundException("Brand not found");
    return brand;
  }

  async findAll(queryBrandDto: QueryBrandDto): Promise<PaginationResponse<ResponseBrandDto>> {
    this.logger.info(`Fetching brands with query: ${JSON.stringify(queryBrandDto)}`);

    const { page, limit } = queryBrandDto;

    const cacheKey = `brands:${JSON.stringify(queryBrandDto)}`;
    const cached = await this.redisService.get<PaginationResponse<ResponseBrandDto>>(cacheKey);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.brandsRepository.findAll(queryBrandDto),
      this.brandsRepository.count(queryBrandDto),
    ]);

    const meta: Meta = generateMeta(page, limit, total);

    await this.redisService.set(cacheKey, { data, meta });

    return { data, meta };
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<ResponseBrandDto> {
    this.logger.info(`Updating brand with id: ${id}`);
    const { name } = updateBrandDto;

    const brand = await this.findOneById(id);

    const existing = await this.brandsRepository.findOneByName(name ?? brand.name);
    if (existing && existing.id !== id)
      throw new ConflictException("Brand with this name already exists");

    const updated = await this.brandsRepository.update(id, updateBrandDto);

    await this.redisService.deleteByPattern("brands*");

    return updated;
  }
}
