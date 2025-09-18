import { Prisma } from "@prisma/client";
import z from "zod";

import { QuerySchema } from "src/common/helpers/base-query.dto";

export const queryBrandSchema = QuerySchema.extend({
  sort: z
    .string()
    .refine((val) => Object.keys(Prisma.BrandScalarFieldEnum).includes(val), {
      message: "Invalid sort field",
    })
    .default("createdAt"),
});

export type QueryBrandDto = z.infer<typeof queryBrandSchema>;
