"use client";

import { useQuery } from "@tanstack/react-query";

import useAuth from "@/features/auth/hooks/use-auth";
import { getEmployees } from "../services/user.service";

const useEmployees = (params = {}) => {
  const { isAuthenticated, isInitialized } = useAuth();

  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => getEmployees(params),
    enabled: isInitialized && isAuthenticated,
  });
};

export default useEmployees;