
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";

const validateObjectId = (id, field = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${field}`);
    error.statusCode = 400;
    throw error;
  }
};

// 1. Create notification
export const createNotification = async ({
  recipient,
  title,
  message,
  type,
  link = null,
}) => {
  validateObjectId(recipient, "recipient ID");

  return await Notification.create({
    recipient,
    title,
    message,
    type,
    link,
  });
};

// 2. Get logged-in user's notifications
export const getNotifications = async (userId, page = 1, limit = 20) => {
  validateObjectId(userId, "user ID");

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments({ recipient: userId }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 3. Get unread notification count
export const getUnreadCount = async (userId) => {
  validateObjectId(userId, "user ID");

  return await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

// 4. Mark one notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  validateObjectId(notificationId, "notification ID");
  validateObjectId(userId, "user ID");

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    { new: true }
  );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

// 5. Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  validateObjectId(userId, "user ID");

  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return result;
};

// 6. Delete one notification
export const deleteNotification = async (notificationId, userId) => {
  validateObjectId(notificationId, "notification ID");
  validateObjectId(userId, "user ID");

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

// 7. Delete all notifications
export const deleteAllNotifications = async (userId) => {
  validateObjectId(userId, "user ID");

  return await Notification.deleteMany({
    recipient: userId,
  });
};
