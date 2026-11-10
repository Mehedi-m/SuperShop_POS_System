
import { z } from "zod";

// Bangladesh mobile number validation
const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^01[3-9]\d{8}$/,
    "Please provide a valid Bangladesh mobile number"
  );

// Optional email validation
const emailSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase()
    .optional()
);

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

// Initial Business + Admin Setup
export const initialSetupSchema = z.object({
  body: z
    .object({
      businessName: z
        .string()
        .trim()
        .min(2, "Business name must be at least 2 characters"),

      businessPhone: phoneSchema,

      businessEmail: emailSchema,

      address: z.string().trim().optional(),

      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters"),

      phone: phoneSchema,

      email: emailSchema,

      password: passwordSchema,

      confirmPassword: z.string(),
    })
    .refine(
      (data) => data.password === data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    ),
});

// New User Registration
export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters"),

      phone: phoneSchema,

      email: emailSchema,

      password: passwordSchema,

      confirmPassword: z.string(),
    })
    .refine(
      (data) => data.password === data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }
    ),
});

// User Login
export const loginSchema = z.object({
  body: z.object({
    phone: phoneSchema,

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});
