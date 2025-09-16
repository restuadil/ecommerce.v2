import { UserRole, UserStatus } from "@prisma/client";
import z from "zod";

export const registerCustomerSchema = z
  .object({
    username: z.string().min(3).max(30),
    email: z.email(),
    password: z.string().min(8),
  })
  .strict()
  .transform((data) => ({
    ...data,
    roles: [UserRole.CUSTOMER],
    status: UserStatus.INACTIVE,
  }));

export type RegisterCustomerDto = z.infer<typeof registerCustomerSchema>;
