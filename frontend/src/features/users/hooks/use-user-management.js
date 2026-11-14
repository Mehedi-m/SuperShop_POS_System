"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getPendingUsers,
  getAllBranches,
  getCountersByBranch,
  approveUser,
  rejectUser,
} from "../services/user.service";

// Pending users
export const usePendingUsers = () => {
  return useQuery({
    queryKey: ["pending-users"],
    queryFn: getPendingUsers,
    staleTime: 60 * 1000,
  });
};

// All branches
export const useAllBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: getAllBranches,
    staleTime: 60 * 1000,
  });
};

// Counters by branch
export const useBranchCounters = (branchId) => {
  return useQuery({
    queryKey: ["counters", branchId],
    queryFn: () => getCountersByBranch(branchId),
    enabled: Boolean(branchId),
    staleTime: 60 * 1000,
  });
};

// Approve user
export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveUser,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pending-users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["branches"],
      });

      if (variables.counterId) {
        queryClient.invalidateQueries({
          queryKey: ["counters", variables.branchId],
        });
      }
    },
  });
};

// Reject user
export const useRejectUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-users"],
      });
    },
  });
};