
import { z } from "zod";

export const initialSetupSchema = z
  .object({
    businessName: z.string().min(2, "Business name is required"),
    businessPhone: z.string().min(10, "Enter a valid business phone"),
    businessEmail: z.union([
      z.string().email("Enter a valid business email"),
      z.literal(""),
    ]),
    address: z.string().min(3, "Business address is required"),

    name: z.string().min(2, "Admin name is required"),
    phone: z.string().min(10, "Enter a valid phone number"),
    email: z.union([
      z.string().email("Enter a valid email"),
      z.literal(""),
    ]),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


export const loginSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters"),

    phone: z
      .string()
      .trim()
      .regex(
        /^01[3-9]\d{8}$/,
        "Please provide a valid Bangladesh mobile number"
      ),

    email: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .trim()
        .email("Please provide a valid email address")
        .toLowerCase()
        .optional()
    ),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long"),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );