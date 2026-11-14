
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus } from "lucide-react";

import AuthLayout from "@/features/auth/components/auth-layout";
import { registerSchema } from "@/schemas/auth.schema";
import { registerUser } from "@/features/auth/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData) => {
    setServerError("");

    try {
      await registerUser(formData);
      router.replace("/login?registered=success");
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const passwordClass =
    "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const renderError = (message) =>
    message ? (
      <p className="mt-1 text-xs text-red-600">{message}</p>
    ) : null;

  return (
    <AuthLayout variant="reverse">
      <div className="mb-4">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <UserPlus size={22} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create an account
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Register to get started with Super Shop Management.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            className={inputClass}
            {...register("name")}
          />

          {renderError(errors.name?.message)}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            maxLength={11}
            className={inputClass}
            {...register("phone")}
          />

          {renderError(errors.phone?.message)}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Email Address{" "}
            <span className="font-normal text-slate-400">
              (Optional)
            </span>
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            className={inputClass}
            {...register("email")}
          />

          {renderError(errors.email?.message)}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
              className={passwordClass}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {renderError(errors.password?.message)}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Confirm Password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className={passwordClass}
              {...register("confirmPassword")}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {renderError(errors.confirmPassword?.message)}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
