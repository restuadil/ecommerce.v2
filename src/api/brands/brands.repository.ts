import { Injectable } from "@nestjs/common";

import { Brand, Prisma } from "@prisma/client";

import { Query } from "src/common/helpers/base-query.dto";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class BrandsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return this.prismaService.brand.create({ data });
  }

  async findOneByName(name: string): Promise<Brand | null> {
    return this.prismaService.brand.findUnique({ where: { name } });
  }

  async findOneById(id: string): Promise<Brand | null> {
    return this.prismaService.brand.findUnique({ where: { id } });
  }

  async findAll(options: Query): Promise<Brand[]> {
    return this.prismaService.brand.findMany({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      orderBy: {
        [options.sort]: options.order,
      },
      where: options.search
        ? {
            OR: [{ name: { contains: options.search, mode: "insensitive" } }],
          }
        : undefined,
    });
  }

  async count(options: Query): Promise<number> {
    return this.prismaService.brand.count({
      where: options.search
        ? {
            OR: [{ name: { contains: options.search, mode: "insensitive" } }],
          }
        : undefined,
    });
  }
}
