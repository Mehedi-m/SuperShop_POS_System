"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/features/auth/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();

  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">
        Loading...
      </p>
    </div>
  );
}