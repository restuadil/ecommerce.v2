import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";

import { BrandsRepository } from "./brands.repository";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { ResponseBrandDto } from "./dto/response-brand.dto";

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
}
