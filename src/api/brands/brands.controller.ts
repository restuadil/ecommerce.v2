import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";

import { UserRole } from "@prisma/client";

import { Public } from "src/common/decortators/public.decorator";
import { Roles } from "src/common/decortators/roles.decorator";
import { idSchema } from "src/common/helpers/id.dto";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { ControllerResponse } from "src/types/web.type";

import { BrandsService } from "./brands.service";
import { CreateBrandDto, createBrandSchema } from "./dto/create-brand.dto";
import { QueryBrandDto, queryBrandSchema } from "./dto/query-brand.dto";
import { ResponseBrandDto } from "./dto/response-brand.dto";

@Controller("brands")
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN)
  async create(
    @Body(new ZodPipe(createBrandSchema)) createBrandDto: CreateBrandDto,
  ): Promise<ControllerResponse<ResponseBrandDto>> {
    const result = await this.brandsService.create(createBrandDto);
    return {
      message: "Brand created successfully",
      data: result,
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Public()
  async findOne(
    @Param("id", new ZodPipe(idSchema)) id: string,
  ): Promise<ControllerResponse<ResponseBrandDto>> {
    const result = await this.brandsService.findOneById(id);
    return {
      message: "Brands retrieved successfully",
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Public()
  async findAll(
    @Query(new ZodPipe(queryBrandSchema)) queryBrandDto: QueryBrandDto,
  ): Promise<ControllerResponse<ResponseBrandDto[]>> {
    const { data, meta } = await this.brandsService.findAll(queryBrandDto);
    return {
      message: "Brands retrieved successfully",
      data,
      meta,
    };
  }
}
