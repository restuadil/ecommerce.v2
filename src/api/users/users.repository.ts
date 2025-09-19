import { Injectable } from "@nestjs/common";

import { User } from "@prisma/client";

import { Query } from "src/common/helpers/base-query.dto";
import { PrismaService } from "src/common/prisma/prisma.service";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

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

  async findOneById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      include: {
        Store: {
          select: {
            id: true,
          },
        },
        Cart: {
          select: {
            id: true,
          },
        },
        UserAddress: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({ data });
  }

  async findOneByActivationCode(activationCode: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: { activation_code: activationCode },
    });
  }

  async findMany(options: Query): Promise<User[]> {
    return this.prismaService.user.findMany({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      orderBy: {
        [options.sort]: options.order,
      },
      where: options.search
        ? {
            OR: [
              {
                email: { contains: options.search, mode: "insensitive" },
                username: { contains: options.search, mode: "insensitive" },
                fullName: { contains: options.search, mode: "insensitive" },
              },
            ],
          }
        : undefined,
    });
  }

  async count(options: Query): Promise<number> {
    return this.prismaService.user.count({
      where: options.search
        ? {
            OR: [
              {
                email: { contains: options.search, mode: "insensitive" },
                username: { contains: options.search, mode: "insensitive" },
                fullName: { contains: options.search, mode: "insensitive" },
              },
            ],
          }
        : undefined,
    });
  }

  async updateUserById(id: string, data: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data,
    });
  }
}
