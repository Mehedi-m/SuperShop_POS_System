"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccessibleBranches } from "../services/branch.service";
import useAuth from "@/features/auth/hooks/use-auth";

const useBranches = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  return useQuery({
    queryKey: ["accessible-branches"],
    queryFn: getAccessibleBranches,
    enabled: isInitialized && isAuthenticated,
  });
};

export default useBranches;