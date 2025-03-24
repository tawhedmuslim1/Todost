import { z } from "zod";

export const schema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required",
    })
    .max(32, {
      message: "Title must be less than 32 characters",
    }),
  isUrgent: z.boolean().optional().default(false),
  isImportant: z.boolean().optional().default(false),
});
