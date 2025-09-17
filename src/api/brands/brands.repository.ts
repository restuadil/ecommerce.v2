import { Injectable } from "@nestjs/common";

import { Brand, Prisma } from "@prisma/client";

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
}
