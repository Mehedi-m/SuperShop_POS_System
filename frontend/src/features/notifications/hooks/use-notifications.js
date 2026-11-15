
"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notification.service";

const useNotifications = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => getNotifications(page, limit),
    staleTime: 30 * 1000,
  });
};

export default useNotifications;
