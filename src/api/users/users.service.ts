import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { generateMeta } from "src/common/helpers/generate-meta";
import { RedisService } from "src/common/redis/redis.service";
import { deletePasswordUser, OmitPasswordUser, ResponseUserDto } from "src/types/user.type";
import { Meta, PaginationResponse } from "src/types/web.type";

import { CreateUserDto } from "./dto/create-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
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
    return this.usersRepository.findOneByEmailOrUsername(email, username);
  }

  async getOneByEmailOrUsername(email: string, username: string): Promise<ResponseUserDto> {
    const user = await this.usersRepository.findOneByEmailOrUsername(email, username);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return this.usersRepository.createUser(createUserDto);
  }
  async getOneByActivationCode(activationCode: string): Promise<ResponseUserDto> {
    const user = await this.usersRepository.findOneByActivationCode(activationCode);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findOneById(id: string): Promise<ResponseUserDto | null> {
    return this.usersRepository.findOneById(id);
  }

  async getOneById(id: string): Promise<ResponseUserDto> {
    const user = await this.usersRepository.findOneById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
    return this.usersRepository.updateUserById(id, updateUserDto);
  }

  async findMany(queryUserDto: QueryUserDto): Promise<PaginationResponse<OmitPasswordUser>> {
    this.logger.info(`Fetching users with query: ${JSON.stringify(queryUserDto)}`);

    const { page, limit } = queryUserDto;

    const cacheKey = `users:${JSON.stringify(queryUserDto)}`;
    const cached = await this.redisService.get<PaginationResponse<OmitPasswordUser>>(cacheKey);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.usersRepository.findMany(queryUserDto),
      this.usersRepository.count(queryUserDto),
    ]);

    const meta: Meta = generateMeta(page, limit, total);

    await this.redisService.set(cacheKey, { data, meta });

    return {
      data: data.map((user) => deletePasswordUser(user)),
      meta,
    };
  }

  async count(queryUserDto: QueryUserDto): Promise<number> {
    return this.usersRepository.count(queryUserDto);
  }
}
