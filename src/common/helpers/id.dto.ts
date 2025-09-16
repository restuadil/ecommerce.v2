import { z } from "zod";

export const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: "Invalid MongoDB _id format. Must be a 24-character hexadecimal string.",
});
