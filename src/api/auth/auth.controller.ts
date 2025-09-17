import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Res,
} from "@nestjs/common";

import { Response } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { Me } from "src/common/decortators/me.decorator";
import { Public } from "src/common/decortators/public.decorator";
import { ZodPipe } from "src/common/pipe/zod.pipe";
import { UserPayload } from "src/types/jwt.type";
import { ControllerResponse } from "src/types/web.type";

import { AuthService } from "./auth.service";
import { ActivationDto, activationSchema } from "./dto/activation-auth.dto";
import { LoginDto, loginSchema } from "./dto/login-auth.dto";
import { RegisterCustomerDto, registerCustomerSchema } from "./dto/register-customer.dto";
import { RegisterStoreAdminDto, registerStoreAdminSchema } from "./dto/register-store-admin.dto";
import { LoginResponseDto, MeResponseDto, RegisterResponseDto } from "./dto/response-auth.dt";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly authService: AuthService,
  ) {}
  @Post("register/customer")
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async registerCustomer(
    @Body(new ZodPipe(registerCustomerSchema)) registerCustomerDto: RegisterCustomerDto,
  ): Promise<ControllerResponse<RegisterResponseDto>> {
    this.logger.info(`AuthController - registerCustomer`);
    const result = await this.authService.create(registerCustomerDto);
    return {
      message: "User registered successfully",
      data: result,
    };
  }

  @Post("register/store-admin")
  @HttpCode(HttpStatus.CREATED)
  @Public()
  async registerStoreAdmin(
    @Body(new ZodPipe(registerStoreAdminSchema)) registerStoreAdminDto: RegisterStoreAdminDto,
  ): Promise<ControllerResponse<RegisterResponseDto>> {
    this.logger.info(`AuthController - registerCustomer`);
    const result = await this.authService.create(registerStoreAdminDto);
    return {
      message: "User registered successfully",
      data: result,
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(
    @Body(new ZodPipe(loginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ControllerResponse<LoginResponseDto>> {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return {
      message: "User logged in successfully",
      data: { accessToken },
    };
  }

  @Get("activate")
  @HttpCode(HttpStatus.OK)
  @Public()
  async activate(
    @Query(new ZodPipe(activationSchema)) activationDto: ActivationDto,
  ): Promise<ControllerResponse<RegisterResponseDto>> {
    const result = await this.authService.activate(activationDto);
    return {
      message: "User activated successfully",
      data: result,
    };
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  async me(@Me() me: UserPayload): Promise<ControllerResponse<MeResponseDto>> {
    const result = await this.authService.me(me);
    return {
      message: "User profile fetched successfully",
      data: result,
    };
  }
}
