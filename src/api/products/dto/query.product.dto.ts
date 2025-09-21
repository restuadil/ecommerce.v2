import { Prisma, ProductStatus } from "@prisma/client";
import z from "zod";

import { QuerySchema } from "src/common/helpers/base-query.dto";
import { idSchema } from "src/common/helpers/id.dto";

export const queryProductSchema = QuerySchema.extend({
  sort: z
    .string()
    .refine((val) => Object.keys(Prisma.ProductScalarFieldEnum).includes(val), {
      message: "Invalid sort field",
    })
    .default("createdAt"),
  storeId: idSchema.optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  categoryIds: z.array(idSchema).optional(),
  brandId: idSchema.optional(),
})
  .strict()
  .transform((data) => ({
    ...data,
    status: ProductStatus.ACTIVE,
  }));

export type QueryProductDto = z.infer<typeof queryProductSchema>;
