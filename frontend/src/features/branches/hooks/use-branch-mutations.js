"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBranch,
  updateBranch,
  toggleBranchStatus,
} from "../services/branch.service";

const useBranchMutations = () => {
  const queryClient = useQueryClient();

  const refreshBranchQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["branches"] });
    queryClient.invalidateQueries({ queryKey: ["accessible-branches"] });
  };

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: refreshBranchQueries,
  });

  const updateMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: refreshBranchQueries,
  });

  const statusMutation = useMutation({
    mutationFn: toggleBranchStatus,
    onSuccess: refreshBranchQueries,
  });

  return {
    createBranch: createMutation.mutateAsync,
    updateBranch: updateMutation.mutateAsync,
    toggleBranchStatus: statusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isTogglingStatus: statusMutation.isPending,
  };
};

export default useBranchMutations;
