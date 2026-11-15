
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "../services/notification.service";

const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });

      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
  });
};

export default useMarkNotificationRead;
