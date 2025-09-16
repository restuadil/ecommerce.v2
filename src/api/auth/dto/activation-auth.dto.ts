import z from "zod";

export const activationSchema = z
  .object({
    activation_code: z.string(),
  })
  .strict();

export type ActivationDto = z.infer<typeof activationSchema>;
