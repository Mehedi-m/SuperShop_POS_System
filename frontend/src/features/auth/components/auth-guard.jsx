
"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import useAuth from "@/features/auth/hooks/use-auth";
import { NAVIGATION } from "@/constants/navigation";
import { hasPermission } from "@/constants/permissions";

const canAccessRoute = (pathname, user) => {
  if (!user?.role) return false;

  // Collect every navigation item
  const navigationItems = NAVIGATION.flatMap((group) =>
    group.items
  );

  // Find the most specific matching route
  const matchingRoute = navigationItems
    .filter(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  // Deny routes that are not registered
  if (!matchingRoute) return false;

  // Check role restriction
  if (
    matchingRoute.roles &&
    !matchingRoute.roles.includes(user.role)
  ) {
    return false;
  }

  // Check permission restriction
  if (
    matchingRoute.permission &&
    !hasPermission(user.role, matchingRoute.permission)
  ) {
    return false;
  }

  return true;
};

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    logout,
  } = useAuth();

  const logoutStarted = useRef(false);

  const isAuthorized = useMemo(
    () => canAccessRoute(pathname, user),
    [pathname, user]
  );

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // No authenticated user
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Authenticated but unauthorized
    if (!isAuthorized && !logoutStarted.current) {
      logoutStarted.current = true;

      const forceLogout = async () => {
        try {
          await logout();
        } finally {
          router.replace("/login");
        }
      };

      forceLogout();
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    isAuthorized,
    logout,
    router,
  ]);

  if (
    !isInitialized ||
    isLoading ||
    !isAuthenticated ||
    !isAuthorized
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Checking access...
        </p>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
