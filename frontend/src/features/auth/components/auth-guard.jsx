"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import useAuth from "@/features/auth/hooks/use-auth";

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    isAuthenticated,
    isLoading,
    isInitialized,
  } = useAuth();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      const redirectUrl = `/login?next=${encodeURIComponent(pathname)}`;

      router.replace(redirectUrl);
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    pathname,
    router,
  ]);

  if (!isInitialized || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  return children;
};

export default AuthGuard;