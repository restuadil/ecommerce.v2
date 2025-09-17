import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { UserRole } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Public } from "src/common/decortators/public.decorator";
import { Roles } from "src/common/decortators/roles.decorator";
import { idSchema } from "src/common/helpers/id.dto";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { ControllerResponse } from "src/types/web.type";

import { BrandsService } from "./brands.service";
import { CreateBrandDto, createBrandSchema } from "./dto/create-brand.dto";
import { QueryBrandDto, queryBrandSchema } from "./dto/query-brand.dto";
import { ResponseBrandDto } from "./dto/response-brand.dto";
import { UpdateBrandDto, updateBrandSchema } from "./dto/update-brand.dto";

@Controller("brands")
export class BrandsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly brandsService: BrandsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN)
  async create(
    @Body(new ZodPipe(createBrandSchema)) createBrandDto: CreateBrandDto,
  ): Promise<ControllerResponse<ResponseBrandDto>> {
    this.logger.info(`BrandsController - Create`);

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
    this.logger.info(`BrandsController - FindOne: ${id}`);

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
    this.logger.info(`BrandsController - FindAll`);

    const { data, meta } = await this.brandsService.findAll(queryBrandDto);
    return {
      message: "Brands retrieved successfully",
      data,
      meta,
    };
  }
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN)
  async update(
    @Param("id", new ZodPipe(idSchema)) id: string,
    @Body(new ZodPipe(updateBrandSchema)) updateBrandDto: UpdateBrandDto,
  ): Promise<ControllerResponse<ResponseBrandDto>> {
    this.logger.info(`BrandsController - Update: ${id}`);

    const result = await this.brandsService.update(id, updateBrandDto);
    return {
      message: "Brand updated successfully",
      data: result,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN)
  async delete(@Param("id", new ZodPipe(idSchema)) id: string): Promise<ControllerResponse<null>> {
    this.logger.info(`BrandsController - Delete: ${id}`);

    await this.brandsService.delete(id);
    return {
      message: "Brand deleted successfully",
      data: null,
    };
  }
}
