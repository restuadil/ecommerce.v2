// ! TODO: add more fields later and relations

export class ResponseProductDto {
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

export const toResponseProductDto = (product: ResponseProductDto): ResponseProductDto => {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    slug: product.slug,
    description: product.description || null,
    price: product.price,
    images: product.images,
    brandId: product.brandId,
    categoryIds: product.categoryIds || [],
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};
