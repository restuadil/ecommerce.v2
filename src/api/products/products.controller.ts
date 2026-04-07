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

import { Me } from "src/common/decortators/me.decorator";
import { Public } from "src/common/decortators/public.decorator";
import { Roles } from "src/common/decortators/roles.decorator";
import { idSchema } from "src/common/helpers/id.dto";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { UserPayload } from "src/types/jwt.type";
import { ControllerResponse } from "src/types/web.type";

import { CreateProductDto, createProductSchema } from "./dto/create-product.dto";
import { QueryProductDto, queryProductSchema } from "./dto/query.product.dto";
import { ResponseProductDto } from "./dto/response-product.dto";
import { UpdateProductDto, updateProductSchema } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly productsService: ProductsService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STORE_ADMIN)
  async create(
    @Me() me: UserPayload,
    @Body(new ZodPipe(createProductSchema)) createProductDto: CreateProductDto,
  ): Promise<ControllerResponse<ResponseProductDto>> {
    this.logger.info(`ProductsController - Create`);
    const result = await this.productsService.create(me, createProductDto);

    return {
      message: "Product created successfully",
      data: result,
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Public()
  async getOneById(
    @Param("id", new ZodPipe(idSchema)) id: string,
  ): Promise<ControllerResponse<ResponseProductDto>> {
    this.logger.info(`ProductsController - GetOneById: ${id}`);
    const result = await this.productsService.getOneById(id);
    return {
      message: "Product fetched successfully",
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Public()
  async getAll(
    @Query(new ZodPipe(queryProductSchema)) queryProductDto: QueryProductDto,
  ): Promise<ControllerResponse<ResponseProductDto[]>> {
    this.logger.info(`ProductsController - GetAll`);
    const { data, meta } = await this.productsService.getAllProducts(queryProductDto);
    return {
      message: "Products fetched successfully",
      data,
      meta,
    };
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STORE_ADMIN)
  async update(
    @Me() me: UserPayload,
    @Param("id", new ZodPipe(idSchema)) id: string,
    @Body(new ZodPipe(updateProductSchema)) updateProductDto: UpdateProductDto,
  ): Promise<ControllerResponse<ResponseProductDto>> {
    this.logger.info(`ProductsController - Update: ${id}`);
    const result = await this.productsService.update(me, id, updateProductDto);
    return {
      message: "Product updated successfully",
      data: result,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STORE_ADMIN)
  async delete(
    @Me() me: UserPayload,
    @Param("id", new ZodPipe(idSchema)) id: string,
  ): Promise<ControllerResponse<null>> {
    this.logger.info(`ProductsController - Delete: ${id}`);
    await this.productsService.delete(me, id);
    return {
      message: "Product deleted successfully",
      data: null,
    };
  }
}
