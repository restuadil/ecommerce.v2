import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { Meta, PaginationResponse } from "src/types/web.type";

import { CreateUserDto } from "./dto/create-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { ResponseUserDto, toResponseUserDto } from "./dto/response-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
  ) {}

  async findOneByEmailOrUsername(email: string, username: string): Promise<ResponseUserDto | null> {
    const user = await this.usersRepository.findOneByEmailOrUsername(email, username);
    return user ? toResponseUserDto(user) : null;
  }

  async getOneByEmailOrUsername(email: string, username: string): Promise<ResponseUserDto> {
    const user = await this.findOneByEmailOrUsername(email, username);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const user = await this.usersRepository.createUser(createUserDto);
    return toResponseUserDto(user);
  }
  async getOneByActivationCode(activationCode: string): Promise<ResponseUserDto> {
    const user = await this.usersRepository.findOneByActivationCode(activationCode);
    if (!user) throw new NotFoundException("User not found");
    return toResponseUserDto(user);
  }

  async findOneById(id: string): Promise<ResponseUserDto | null> {
    const user = await this.usersRepository.findOneById(id);
    return user ? toResponseUserDto(user) : null;
  }

  async getOneById(id: string): Promise<ResponseUserDto> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
    const user = await this.usersRepository.updateUserById(id, updateUserDto);
    return toResponseUserDto(user);
  }

  async findMany(
    queryUserDto: QueryUserDto,
  ): Promise<PaginationResponse<Omit<ResponseUserDto, "password">>> {
    this.logger.info(`Fetching users with query: ${JSON.stringify(queryUserDto)}`);

    const { page, limit } = queryUserDto;

    const cacheKey = `users:${JSON.stringify(queryUserDto)}`;
    const cached =
      await this.redisService.get<PaginationResponse<Omit<ResponseUserDto, "password">>>(cacheKey);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.usersRepository.findMany(queryUserDto),
      this.usersRepository.count(queryUserDto),
    ]);

    const meta: Meta = generateMeta(page, limit, total);

    await this.redisService.set(cacheKey, { data, meta });
    return {
      data: data
        .map((user) => toResponseUserDto(user))
        .map((user) => ({ ...user, password: undefined })),
      meta,
    };
  }

  async count(queryUserDto: QueryUserDto): Promise<number> {
    return this.usersRepository.count(queryUserDto);
  }
}
