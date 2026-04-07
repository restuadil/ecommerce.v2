// ! TODO: add more fields later and relations
import { ProductWithRelations } from "src/types/product.type";
export interface ResponseProductDto {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  brandId: string;
  categoryIds?: string[];
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const toResponseProductDto = (product: ProductWithRelations): ResponseProductDto => {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    slug: product.slug,
    description: product.description || null,
    price: product.price,
    images: product.images,
    brandId: product.brandId,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    categoryIds: product.ProductCategory?.map((c) => c.categoryId) || [],
  };
};
