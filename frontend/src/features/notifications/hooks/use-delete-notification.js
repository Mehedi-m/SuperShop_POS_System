"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "../services/notification.service";

const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,

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

export default useDeleteNotification;