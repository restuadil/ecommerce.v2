import { Injectable } from "@nestjs/common";

import { Category, Prisma } from "@prisma/client";

import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prismaService.category.create({
      data,
    });
  }

  async findOneByNameOrSlug(name: string, slug: string): Promise<Category | null> {
    return this.prismaService.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });
  }

  async findOneById(id: string): Promise<Category | null> {
    return this.prismaService.category.findUnique({
      where: { id },
    });
  }
}
