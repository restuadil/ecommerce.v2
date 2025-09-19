import { Controller, Get, HttpCode, HttpStatus, Inject, Query } from "@nestjs/common";

import { UserRole } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Roles } from "src/common/decortators/roles.decorator";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { OmitPasswordUser } from "src/types/user.type";
import { ControllerResponse } from "src/types/web.type";

import { QueryUserDto, queryUserSchema } from "./dto/query-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN)
  async findAll(
    @Query(new ZodPipe(queryUserSchema)) queryUserDto: QueryUserDto,
  ): Promise<ControllerResponse<OmitPasswordUser[]>> {
    this.logger.info(`User Controller - FindAll`);

    const { data, meta } = await this.usersService.findMany(queryUserDto);

    return {
      message: "Users fetched successfully",
      data,
      meta,
    };
  }
}
