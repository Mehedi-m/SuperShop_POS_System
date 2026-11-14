"use client";

import { useQuery } from "@tanstack/react-query";
import { getCountersByBranch } from "../services/counter.service";

const useCounters = (branchId) => {
  return useQuery({
    queryKey: ["counters", branchId],
    queryFn: () => getCountersByBranch(branchId),
    enabled: !!branchId,
    staleTime: 60 * 1000,
  });
};

export default useCounters;