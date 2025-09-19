import { Injectable } from "@nestjs/common";

import { Prisma, Product } from "@prisma/client";

import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOneByNameOrSlug(name: string, slug: string): Promise<Product | null> {
    return this.prismaService.product.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prismaService.product.create({ data });
  }
}
