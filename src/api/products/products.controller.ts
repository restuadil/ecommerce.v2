import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from "@nestjs/common";

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
import { ResponseProductDto } from "./dto/response-product.dto";
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
}
