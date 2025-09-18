import z from "zod";

import { generateSlug } from "src/common/helpers/generate-slug";

export const updateCategorySchema = z
  .object({
    name: z.string().min(3).max(50).optional(),
  })
  .strict()
  .transform((data) => ({
    ...data,
    slug: data.name ? generateSlug(data.name) : undefined,
  }));

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
