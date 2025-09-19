import { ProductStatus } from "@prisma/client";
import z from "zod";

import { generateSlug } from "src/common/helpers/generate-slug";
import { idSchema } from "src/common/helpers/id.dto";

export const createProductSchema = z
  .object({
    name: z.string().min(3).max(255),
    description: z.string().min(3).max(1024).optional(),
    basePrice: z.number().min(0),
    images: z.array(z.url()),
    brandId: idSchema,
    categoryIds: z.array(idSchema),
  })
  .strict()
  .transform((data) => ({
    ...data,
    slug: generateSlug(data.name),
    status: ProductStatus.ACTIVE,
  }));

export type CreateProductDto = z.infer<typeof createProductSchema>;
