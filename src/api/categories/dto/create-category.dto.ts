import z from "zod";

import { generateSlug } from "src/common/helpers/generate-slug";

export const createCategorySchema = z
  .object({
    name: z.string().min(2).max(50),
  })
  .strict()
  .transform((data) => ({
    ...data,
    slug: generateSlug(data.name),
  }));

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
