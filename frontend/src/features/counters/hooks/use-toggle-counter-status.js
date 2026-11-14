"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleCounterStatus } from "../services/counter.service";

const useToggleCounterStatus = (branchId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (counterId) =>
      toggleCounterStatus(counterId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["counters", branchId],
      });
    },
  });
};

export default useToggleCounterStatus;