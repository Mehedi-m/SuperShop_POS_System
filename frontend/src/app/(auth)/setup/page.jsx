
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Building2, UserRound, Loader2 } from "lucide-react";

import { initialSetupSchema } from "@/schemas/auth.schema";
import { setupBusiness } from "@/features/auth/services/auth.service";

const InputField = ({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <input
      type={type}
      placeholder={placeholder}
      {...register(name)}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
        errors[name] ? "border-red-400" : "border-slate-200"
      }`}
    />

    {errors[name] && (
      <p className="mt-1 text-xs text-red-500">
        {errors[name].message}
      </p>
    )}
  </div>
);

export default function SetupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(initialSetupSchema),
    defaultValues: {
      businessName: "",
      businessPhone: "",
      businessEmail: "",
      address: "",
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");

      await setupBusiness(data);

      router.replace("/login?setup=success");
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Unable to complete initial setup. Please try again."
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Store size={28} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome to Super Shop
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Set up your business and administrator account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* Business Information */}
          <section>
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Building2 size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Business Information
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your shop details
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Business Name"
                name="businessName"
                register={register}
                errors={errors}
                placeholder="e.g. Super Shop"
              />

              <InputField
                label="Business Phone"
                name="businessPhone"
                register={register}
                errors={errors}
                placeholder="01XXXXXXXXX"
              />

              <InputField
                label="Business Email (Optional)"
                name="businessEmail"
                register={register}
                errors={errors}
                type="email"
                placeholder="business@example.com"
              />

              <InputField
                label="Business Address"
                name="address"
                register={register}
                errors={errors}
                placeholder="Enter business address"
              />
            </div>
          </section>

          {/* Admin Information */}
          <section>
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Administrator Account
                </h2>
                <p className="text-xs text-slate-500">
                  Create your first admin account
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Admin Name"
                name="name"
                register={register}
                errors={errors}
                placeholder="Your full name"
              />

              <InputField
                label="Phone Number"
                name="phone"
                register={register}
                errors={errors}
                placeholder="01XXXXXXXXX"
              />

              <InputField
                label="Email (Optional)"
                name="email"
                register={register}
                errors={errors}
                type="email"
                placeholder="admin@example.com"
              />

              <InputField
                label="Password"
                name="password"
                register={register}
                errors={errors}
                type="password"
                placeholder="Minimum 8 characters"
              />

              <div className="sm:col-span-2">
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  register={register}
                  errors={errors}
                  type="password"
                  placeholder="Enter password again"
                />
              </div>
            </div>
          </section>

          {/* Server Error */}
          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Setting up your business...
              </>
            ) : (
              "Create Business & Admin Account"
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            This setup creates your business and its first administrator.
          </p>
        </form>
      </div>
    </main>
  );
}
