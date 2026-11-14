
import { z } from "zod";

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Branch name is required"),
    code: z
      .string()
      .trim()
      .min(2, "Branch code is required")
      .max(20)
      .regex(/^[a-zA-Z0-9-]+$/, "Invalid branch code"),
    address: z.string().trim().min(5, "Address is required"),
    phone: z
      .string()
      .trim()
      .regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number"),
  }),
});

export const updateBranchSchema = z.object({
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
      address: z.string().trim().min(5).optional(),
      phone: z
        .string()
        .trim()
        .regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});
