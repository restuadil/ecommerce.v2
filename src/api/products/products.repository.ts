import { Injectable } from "@nestjs/common";

import { Product } from "@prisma/client";

import { PrismaService } from "src/common/prisma/prisma.service";

import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOneByNameOrSlugInStore(
    id: string,
    name: string,
    slug: string,
  ): Promise<Product | null> {
    return this.prismaService.product.findFirst({
      where: {
        AND: [{ storeId: id }, { OR: [{ name }, { slug }] }],
      },
    });
  }

  async create(storeId: string, data: CreateProductDto): Promise<Product> {
    const { price, brandId, categoryIds, images, name, slug, status, description } = data;

    return this.prismaService.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          price,
          images,
          brandId,
          status,
          storeId,
        },
      });

      await tx.productCategory.createMany({
        data: categoryIds.map((id) => ({
          productId: product.id,
          categoryId: id,
        })),
      });

      return product;
    });
  }

  async findOneById(id: string): Promise<Product | null> {
    return this.prismaService.product.findUnique({
      where: { id },
      include: {
        ProductCategory: {
          select: {
            categoryId: true,
          },
        },
      },
    });
  }
}
