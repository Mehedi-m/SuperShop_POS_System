"use client";

import { useQuery } from "@tanstack/react-query";
import useAuth from "@/features/auth/hooks/use-auth";
import { getAllBranches } from "../services/branch.service";

const useAdminBranches = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();

  return useQuery({
    queryKey: ["branches"],
    queryFn: getAllBranches,
    enabled:
      isInitialized &&
      isAuthenticated &&
      user?.role === "admin",
    staleTime: 60 * 1000,
  });
};

export default useAdminBranches;
