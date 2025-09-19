import { Prisma, UserRole, UserStatus } from "@prisma/client";
import z from "zod";

import { QuerySchema } from "src/common/helpers/base-query.dto";

export const queryUserSchema = QuerySchema.extend({
  sort: z
    .string()
    .refine((val) => Object.keys(Prisma.UserScalarFieldEnum).includes(val), {
      message: "Invalid sort field",
    })
    .default("createdAt"),
  role: z.enum(UserRole).optional(),
  status: z.enum(UserStatus).optional(),
});

export type QueryUserDto = z.infer<typeof queryUserSchema>;
