import z from "zod";

export const resendActivationSchema = z
  .object({
    email: z.email(),
  })
  .strict();

export type ResendActivationDto = z.infer<typeof resendActivationSchema>;
