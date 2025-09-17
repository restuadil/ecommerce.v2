import { Inject, Injectable } from "@nestjs/common";

import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

import { CreateUserDto } from "./dto/create-user.dto";
import { ResponseUserDto } from "./dto/response-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findOneByEmailOrUsername(email: string, username: string) {
    return this.usersRepository.findOneByEmailOrUsername(email, username);
  }

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    return this.usersRepository.createUser(createUserDto);
  }
  async findOneByActivationCode(activationCode: string): Promise<ResponseUserDto | null> {
    return this.usersRepository.findOneByActivationCode(activationCode);
  }

  async findOneById(id: string): Promise<ResponseUserDto | null> {
    return this.usersRepository.findOneById(id);
  }

  async updateUserById(id: string, updateUserDto: UpdateUserDto): Promise<ResponseUserDto> {
    return this.usersRepository.updateUserById(id, updateUserDto);
  }
}
