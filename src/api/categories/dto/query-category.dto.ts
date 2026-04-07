import { Prisma } from "@prisma/client";
import z from "zod";

import { QuerySchema } from "src/common/helpers/base-query.dto";

export const queryCategorySchema = QuerySchema.extend({
  sort: z
    .string()
    .refine((val) => Object.keys(Prisma.CategoryScalarFieldEnum).includes(val), {
      message: "Invalid sort field",
    })
    .default("createdAt"),
});

export type QueryCategoryDto = z.infer<typeof queryCategorySchema>;
