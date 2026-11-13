
import { z } from "zod";

export const createCounterSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Counter name is required"),
    code: z
      .string()
      .trim()
      .min(2, "Counter code is required")
      .max(20)
      .regex(/^[a-zA-Z0-9-]+$/, "Invalid counter code"),
  }),
});

export const updateCounterSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).optional(),
      code: z
        .string()
        .trim()
        .min(2)
        .max(20)
        .regex(/^[a-zA-Z0-9-]+$/)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});
