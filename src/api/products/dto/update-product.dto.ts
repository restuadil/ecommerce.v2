import { ProductStatus } from "@prisma/client";
import z from "zod";

import { generateSlug } from "src/common/helpers/generate-slug";
import { idSchema } from "src/common/helpers/id.dto";

export const updateProductSchema = z
  .object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().min(3).max(1024).optional(),
    price: z.number().min(0).optional(),
    images: z.array(z.url()).optional(),
    brandId: idSchema.optional(),
    categoryIds: z.array(idSchema).optional(),
    status: z.enum(ProductStatus).optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    slug: data.name ? generateSlug(data.name) : undefined,
  }));

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
