import { Injectable } from "@nestjs/common";

import { Category, Prisma } from "@prisma/client";

import { Query } from "src/common/helpers/base-query.dto";
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

  async findManyByIds(ids: string[]): Promise<Category[]> {
    return this.prismaService.category.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findAll(options: Query): Promise<Category[]> {
    return await this.prismaService.category.findMany({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      orderBy: {
        [options.sort]: options.order,
      },
      where: options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { slug: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : undefined,
    });
  }

  async count(options: Query): Promise<number> {
    return await this.prismaService.category.count({
      where: options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" } },
              { slug: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : undefined,
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return await this.prismaService.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.category.delete({
      where: { id },
    });
  }
}
