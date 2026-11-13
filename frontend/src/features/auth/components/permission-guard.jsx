
"use client";

import { hasPermission } from "@/constants/permissions";
import useAuth from "@/features/auth/hooks/use-auth";

const PermissionGuard = ({
  permission,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const allowed = hasPermission(
    user.role,
    permission
  );

  if (!allowed) {
    return fallback;
  }

  return children;
};

export default PermissionGuard;
