
"use client";

import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "../services/notification.service";

const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notification-unread-count"],
    queryFn: getUnreadNotificationCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export default useUnreadCount;
