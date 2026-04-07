import { ProductCategory } from "@prisma/client";

export interface ProductWithRelations {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  brandId: string;
  status: string;
  ProductCategory?: ProductCategory[];
  createdAt?: Date;
  updatedAt?: Date;
}
