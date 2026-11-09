
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

export const registerSchema = z.object({
  body: z.object({
    businessName: z
      .string()
      .trim()
      .min(2, "Business name must be at least 2 characters"),

    name: z
      .string()
      .trim()
      .min(2, "Owner name must be at least 2 characters"),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .transform((value) => value.toLowerCase()),

    password: passwordSchema,

    phone: z
      .string()
      .trim()
      .optional(),

    address: z
      .string()
      .trim()
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});
