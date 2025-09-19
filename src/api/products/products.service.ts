import { Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { RedisService } from "src/common/redis/redis.service";

import { ProductsRepository } from "./products.repository";
import { BrandsService } from "../brands/brands.service";
import { CategoriesService } from "../categories/categories.service";
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

  async create() {}
}
