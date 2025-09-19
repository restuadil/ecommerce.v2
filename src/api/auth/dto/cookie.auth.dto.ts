import z from "zod";

export const cookieSchema = z.string().min(1);

export type CookieDto = z.infer<typeof cookieSchema>;
