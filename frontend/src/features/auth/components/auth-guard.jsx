"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/features/auth/hooks/use-auth";

const AuthGuard = ({ children }) => {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading,
    isInitialized,
  } = useAuth();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    router,
  ]);

  // Wait until initial authentication check completes
  if (!isInitialized || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  return children;
};

export default AuthGuard;