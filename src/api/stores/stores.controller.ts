import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";

import { UserRole } from "@prisma/client";

import { Me } from "src/common/decortators/me.decorator";
import { Roles } from "src/common/decortators/roles.decorator";
import { idSchema } from "src/common/helpers/id.dto";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { UserPayload } from "src/types/jwt.type";
import { ControllerResponse } from "src/types/web.type";

import { CreateStoreDto, createStoreSchema } from "./dto/create-store.dto";
import { ResponseStoreDto } from "./dto/response-store.dto";
import { StoresService } from "./stores.service";

@Controller("stores")
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.STORE_ADMIN)
  async create(
    @Me() me: UserPayload,
    @Body(new ZodPipe(createStoreSchema)) createStoreDto: CreateStoreDto,
  ): Promise<ControllerResponse<ResponseStoreDto>> {
    const result = await this.storesService.create(me, createStoreDto);
    return {
      message: "Store created successfully",
      data: result,
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STORE_ADMIN)
  async getStoreByStoreAmdinId(
    @Param("id", new ZodPipe(idSchema)) id: string,
  ): Promise<ControllerResponse<ResponseStoreDto>> {
    const result = await this.storesService.getStoreByStoreAdminId(id);
    return {
      message: "Store fetched successfully",
      data: result,
    };
  }
}
