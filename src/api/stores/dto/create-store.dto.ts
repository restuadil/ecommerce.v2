import { StoreStatus } from "@prisma/client";
import z from "zod";

export const createStoreSchema = z
  .object({
    name: z.string().min(1).max(255),
    domain: z.url().min(1).max(255).optional(),
    logo: z.url().optional(),
    description: z.string().min(1).optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    status: StoreStatus.ACTIVE,
  }));

export type CreateStoreDto = z.infer<typeof createStoreSchema>;
