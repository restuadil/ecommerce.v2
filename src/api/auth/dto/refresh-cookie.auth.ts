import z from "zod";

export const refreshCookieSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshCookieDto = z.infer<typeof refreshCookieSchema>;
