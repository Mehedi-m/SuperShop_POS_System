
import axiosInstance from "@/lib/axios/axios";

export const getNotifications = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get("/notifications", {
    params: { page, limit },
  });

  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await axiosInstance.get(
    "/notifications/unread-count"
  );

  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await axiosInstance.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.patch(
    "/notifications/read-all"
  );

  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await axiosInstance.delete(
    `/notifications/${notificationId}`
  );

  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await axiosInstance.delete(
    "/notifications/delete-all"
  );

  return response.data;
};
