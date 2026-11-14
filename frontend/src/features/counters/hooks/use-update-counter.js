"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCounter } from "../services/counter.service";

const useUpdateCounter = (branchId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ counterId, payload }) =>
      updateCounter(counterId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["counters", branchId],
      });
    },
  });
};

export default useUpdateCounter;