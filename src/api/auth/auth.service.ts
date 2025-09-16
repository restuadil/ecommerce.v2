import { randomBytes } from "crypto";

import { BadRequestException, ConflictException, Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";

import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { MailService } from "src/common/mail/mail.service";
import { RedisService } from "src/common/redis/redis.service";
import { ConfigService } from "src/config/config.service";
import { UserPayload } from "src/types/jwt.type";

import { LoginDto } from "./dto/login-auth.dto";
import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { RegisterStoreAdminDto } from "./dto/register-store-admin.dto";
import {
  LoginResponseDto,
  RegisterResponseDto,
  toRegisterResponseDto,
} from "./dto/response-auth.dt";
import { UsersService } from "../users/users.service";
import { ActivationDto } from "./dto/activation-auth.dto";
@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}
  private hash(str: string): string {
    return bcrypt.hashSync(str, Number(this.configService.get<number>("SALT")));
  }

  private compare(str: string, hash: string): boolean {
    return bcrypt.compareSync(str, hash);
  }

  private generateTokens(payload: UserPayload): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<number>("JWT_ACCESS_EXPIRATION_TIME"),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get<number>("JWT_REFRESH_EXPIRATION_TIME"),
    });

    return { accessToken, refreshToken };
  }

  async create(
    registerDto: RegisterCustomerDto | RegisterStoreAdminDto,
  ): Promise<RegisterResponseDto> {
    this.logger.info(`Creating a new user with email: ${registerDto.email}`);

    const { email, password, roles, status, username } = registerDto;

    const hashPassword = this.hash(password);
    const activation_code = randomBytes(32).toString("hex");
    const activationExpiresAt = new Date(
      Date.now() + (this.configService.get<number>("ACTIVATION_EXPIRATION_TIME") ?? 900000),
    );

    const existing = await this.usersService.findOneByEmailOrUsername(email, username);
    if (existing) throw new ConflictException("Email or Username already exists");

    const user = await this.usersService.createUser({
      email,
      username,
      password: hashPassword,
      roles,
      status,
      activation_code,
      activationExpiresAt,
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: "Activate your account",
      html: `<h1>Activate your account</h1>
      <p>Please click the link below to activate your account:</p>
      <a href="${this.configService.get<string>(
        "CLIENT_HOST",
      )}/activate/?activation_code=${activation_code}">Activate Account</a>
      <p>This link will expire in 15 minutes.</p>
      <p>Thank you!</p>`,
    });

    return toRegisterResponseDto(user);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.info(`Logging in user with identifier: ${loginDto.identifier}`);

    const { identifier, password } = loginDto;

    const user = await this.usersService.findOneByEmailOrUsername(identifier, identifier);
    if (!user) throw new ConflictException("Invalid credentials");
    if (!this.compare(password, user.password)) throw new ConflictException("Invalid credentials");
    if (user && user.status !== UserStatus.ACTIVE)
      throw new ConflictException("Please activate your account to login");

    const payload: UserPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    await this.redisService.set(
      `refreshToken:${user.id}`,
      refreshToken,
      this.configService.get<number>("REDIS_TTL"),
    );

    return { accessToken, refreshToken };
  }

  async activate(activationDto: ActivationDto): Promise<RegisterResponseDto> {
    this.logger.info(`Activating user with activation code: ${activationDto.activation_code}`);
    const { activation_code } = activationDto;

    const user = await this.usersService.findOneByActivationCode(activation_code);
    if (!user) throw new BadRequestException("Invalid activation code");
    if (user.status === UserStatus.ACTIVE) throw new BadRequestException("User is already active");
    if (user.activationExpiresAt && user.activationExpiresAt < new Date())
      throw new ConflictException("Activation code has expired");

    const updatedUser = await this.usersService.updateUserById(user.id, {
      status: UserStatus.ACTIVE,
      activation_code: null,
      activationExpiresAt: null,
    });

    return toRegisterResponseDto(updatedUser);
  }
}
