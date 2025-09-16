import { Injectable } from "@nestjs/common";

import { Prisma, User } from "@prisma/client";

import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOneByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  async findOneByActivationCode(activationCode: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { activation_code: activationCode },
    });
  }

  async updateUserById(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }
}
