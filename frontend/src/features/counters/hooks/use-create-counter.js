"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCounter } from "../services/counter.service";

const useCreateCounter = (branchId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      createCounter(branchId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["counters", branchId],
      });
    },
  });
};

export default useCreateCounter;