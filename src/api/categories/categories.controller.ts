import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from "@nestjs/common";

import { UserRole } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Public } from "src/common/decortators/public.decorator";
import { Roles } from "src/common/decortators/roles.decorator";
import { idSchema } from "src/common/helpers/id.dto";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { ControllerResponse } from "src/types/web.type";

import { CategoriesService } from "./categories.service";
import { CreateCategoryDto, createCategorySchema } from "./dto/create-category.dto";
import { ResponseCategoryDto } from "./dto/response-category.dto";

@Controller("categories")
export class CategoriesController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly categoriesService: CategoriesService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN)
  async create(
    @Body(new ZodPipe(createCategorySchema)) createCategoryDto: CreateCategoryDto,
  ): Promise<ControllerResponse<ResponseCategoryDto>> {
    this.logger.info(`CategoyController - Create`);
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: "Category created successfully",
      data: category,
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Public()
  async findOneById(
    @Param("id", new ZodPipe(idSchema)) id: string,
  ): Promise<ControllerResponse<ResponseCategoryDto>> {
    this.logger.info(`CategoyController - FindOneById: ${id}`);

    const result = await this.categoriesService.findOneById(id);
    return {
      message: "Category fetched successfully",
      data: result,
    };
  }
}
