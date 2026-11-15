
import {
  getNotifications as getNotificationsService,
  getUnreadCount as getUnreadCountService,
  markNotificationAsRead as markNotificationAsReadService,
  markAllNotificationsAsRead as markAllNotificationsAsReadService,
  deleteNotification as deleteNotificationService,
  deleteAllNotifications as deleteAllNotificationsService,
} from "../services/notification.service.js";
import Branch from "../models/branch.model.js";
import Counter from "../models/counter.model.js";

// Get notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(req.query.limit) || 20)
    );

    const result = await getNotificationsService(
      userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await getUnreadCountService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Unread notification count fetched successfully",
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

// Mark one notification as read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await markNotificationAsReadService(
      req.params.notificationId,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsAsReadService(
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete one notification
export const deleteNotification = async (req, res, next) => {
  try {
    await deleteNotificationService(
      req.params.notificationId,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res, next) => {
  try {
    const result = await deleteAllNotificationsService(req.user._id);

    return res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Send notifications to multiple users without duplicates
const notifyUsers = async (recipients, notification) => {
  const uniqueRecipients = [
    ...new Set(
      recipients
        .filter(Boolean)
        .map((id) => id.toString())
    ),
  ];

  const results = await Promise.allSettled(
    uniqueRecipients.map((recipient) =>
      createNotification({
        recipient,
        ...notification,
      })
    )
  );

  const failed = results.filter(
    (result) => result.status === "rejected"
  );

  if (failed.length) {
    console.error(
      `${failed.length} notification(s) could not be created`
    );
  }
};

// Get all active admin IDs
const getAdminIds = async () => {
  const admins = await User.find({
    role: "admin",
    accountStatus: "approved",
    isActive: true,
  }).select("_id").lean();

  return admins.map((admin) => admin._id);
};

// Get branch managers and inventory managers
const getBranchStaffIds = async (branchId) => {
  const branch = await Branch.findById(branchId)
    .select("manager inventoryManager")
    .lean();

  if (!branch) return [];

  return [
    branch.manager,
    branch.inventoryManager,
  ].filter(Boolean);
};

// 1. Branch created
export const notifyBranchCreated = async (branch) => {
  const admins = await getAdminIds();

  await notifyUsers(admins, {
    title: "New Branch Created",
    message: `A new branch "${branch.name}" has been created.`,
    type: "branch_update",
    link: "/branches",
  });
};

// 2. Branch updated
export const notifyBranchUpdated = async (branch) => {
  const admins = await getAdminIds();
  const branchStaff = await getBranchStaffIds(branch._id);

  await notifyUsers(
    [...admins, ...branchStaff],
    {
      title: "Branch Updated",
      message: `Branch "${branch.name}" information has been updated.`,
      type: "branch_update",
      link: "/branches",
    }
  );
};

// 3. Branch status changed
export const notifyBranchStatusChanged = async (branch) => {
  const admins = await getAdminIds();
  const branchStaff = await getBranchStaffIds(branch._id);

  const status = branch.isActive ? "activated" : "deactivated";

  await notifyUsers(
    [...admins, ...branchStaff],
    {
      title: `Branch ${branch.isActive ? "Activated" : "Deactivated"}`,
      message: `Branch "${branch.name}" has been ${status}.`,
      type: "branch_update",
      link: "/branches",
    }
  );
};

// 4. Counter created
export const notifyCounterCreated = async (counter) => {
  const admins = await getAdminIds();
  const branchStaff = await getBranchStaffIds(counter.branch);

  await notifyUsers(
    [...admins, ...branchStaff],
    {
      title: "New Counter Created",
      message: `Counter "${counter.name}" has been created.`,
      type: "counter_update",
      link: "/counters",
    }
  );
};

// 5. Counter updated
export const notifyCounterUpdated = async (counter) => {
  const admins = await getAdminIds();
  const branchStaff = await getBranchStaffIds(counter.branch);

  await notifyUsers(
    [
      ...admins,
      ...branchStaff,
      counter.cashier?._id || counter.cashier,
    ],
    {
      title: "Counter Updated",
      message: `Counter "${counter.name}" information has been updated.`,
      type: "counter_update",
      link: "/counters",
    }
  );
};

// 6. Counter status changed
export const notifyCounterStatusChanged = async (counter) => {
  const admins = await getAdminIds();
  const branchStaff = await getBranchStaffIds(counter.branch);

  const status = counter.isActive ? "activated" : "deactivated";

  await notifyUsers(
    [
      ...admins,
      ...branchStaff,
      counter.cashier,
    ],
    {
      title: `Counter ${counter.isActive ? "Activated" : "Deactivated"}`,
      message: `Counter "${counter.name}" has been ${status}.`,
      type: "counter_update",
      link: "/counters",
    }
  );
};
