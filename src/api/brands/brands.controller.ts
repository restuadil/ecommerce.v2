import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { UserRole } from "@prisma/client";

import { Roles } from "src/common/decortators/roles.decorator";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { ControllerResponse } from "src/types/web.type";

import { BrandsService } from "./brands.service";
import { CreateBrandDto, createBrandSchema } from "./dto/create-brand.dto";
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
}
