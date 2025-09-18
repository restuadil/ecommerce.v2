import z from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  logo: z.url().optional(),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
