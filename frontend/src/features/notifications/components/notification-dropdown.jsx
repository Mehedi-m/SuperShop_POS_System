
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bell,
  Trash2,
  X,
  Loader2,
  BellRing,
  Check,
} from "lucide-react";

import useNotifications from "../hooks/use-notifications";
import useUnreadCount from "../hooks/use-unread-count";
import useMarkNotificationRead from "../hooks/use-mark-notification-read";
import useDeleteNotification from "../hooks/use-delete-notification";
const getNotificationList = (response) => {
  return (
    response?.data?.notifications ??
    response?.notifications ??
    response?.data?.items ??
    response?.items ??
    (Array.isArray(response?.data) ? response.data : null) ??
    (Array.isArray(response) ? response : [])
  );
};

const getUnreadTotal = (response) => {
  const value =
    response?.data?.unreadCount ??
    response?.unreadCount ??
    response?.data?.count ??
    response?.count ??
    response?.data;

  return typeof value === "number" ? value : 0;
};

const formatTime = (date) => {
  if (!date) return "";

  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) return "";

  const difference = Date.now() - timestamp;

  if (difference < 60000) return "Just now";
  if (difference < 3600000)
    return `${Math.floor(difference / 60000)}m ago`;
  if (difference < 86400000)
    return `${Math.floor(difference / 3600000)}h ago`;

  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
  });
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const router = useRouter();

  const {
    data: notificationResponse,
    isLoading,
    isError,
    refetch,
  } = useNotifications(1, 10);

  const { data: unreadResponse } = useUnreadCount();

  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();

  const notifications = getNotificationList(notificationResponse);
  const unreadCount = getUnreadTotal(unreadResponse);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markReadMutation.mutateAsync(notification._id);
      } catch {
        return;
      }
    }

    setIsOpen(false);

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleDelete = async (event, notificationId) => {
    event.stopPropagation();

    try {
      await deleteMutation.mutateAsync(notificationId);
    } catch {
      // Keep the dropdown open if deletion fails.
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        title="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell size={19} strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-[100] mt-3 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount} unread notifications
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notifications"
            >
              <X size={17} />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto">

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2
                  size={23}
                  className="animate-spin text-emerald-600"
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading notifications...
                </p>
              </div>
            ) : isError ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-800">
                  Unable to load notifications
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <BellRing size={22} />
                </div>

                <h4 className="mt-3 text-sm font-semibold text-slate-800">
                  No notifications
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  You are all caught up.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleNotificationClick(notification);
                    }
                  }}
                  className={`group flex cursor-pointer gap-3 border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50 ${
                    !notification.isRead ? "bg-emerald-50/40" : ""
                  }`}
                >
                  {/* Unread Indicator */}
                  <div className="mt-1 shrink-0">
                    <span
                      className={`block h-2.5 w-2.5 rounded-full ${
                        notification.isRead
                          ? "bg-slate-200"
                          : "bg-emerald-600"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-800">
                        {notification.title}
                      </h4>

                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {notification.message}
                    </p>

                    {!notification.isRead && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <Check size={12} />
                        Unread
                      </span>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(event) =>
                      handleDelete(event, notification._id)
                    }
                    disabled={deleteMutation.isPending}
                    title="Delete notification"
                    aria-label="Delete notification"
                    className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg text-slate-400 opacity-100 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!isLoading && !isError && notifications.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-3">
              <p className="text-center text-xs text-slate-400">
                Showing your latest 10 notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
