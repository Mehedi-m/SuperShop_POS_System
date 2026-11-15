
import User from "../models/user.model.js";
import { createNotification } from "./notification.service.js";
import Branch from "../models/branch.model.js";

// Notify all active admins about new registration
export const notifyAdminsAboutRegistration = async (user) => {
  const admins = await User.find({
    role: "admin",
    accountStatus: "approved",
    isActive: true,
  }).select("_id");

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipient: admin._id,
        title: "New Employee Registration",
        message: `${user.name} has submitted a new registration request.`,
        type: "employee_registration",
      })
    )
  );
};

// Notify employee about approval
export const notifyEmployeeAboutApproval = async (user) => {
  return await createNotification({
    recipient: user._id,
    title: "Account Approved",
    message: `Your account has been approved. Your assigned role is ${user.role.replace("_", " ")}.`,
    type: "employee_approval",
  });
};

// Notify employee about rejection
export const notifyEmployeeAboutRejection = async (user) => {
  return await createNotification({
    recipient: user._id,
    title: "Registration Rejected",
    message: "Your registration request has been rejected by the admin.",
    type: "employee_rejection",
  });
};

const notifyUsers = async (recipients, notification) => {
  const uniqueRecipients = [
    ...new Set(
      recipients.filter(Boolean).map((id) => id.toString())
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

const getAdminIds = async () => {
  const admins = await User.find({
    role: "admin",
    accountStatus: "approved",
    isActive: true,
  })
    .select("_id")
    .lean();

  return admins.map((admin) => admin._id);
};

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

// Branch Notifications

export const notifyBranchCreated = async (branch) => {
  const admins = await getAdminIds();

  await notifyUsers(admins, {
    title: "New Branch Created",
    message: `A new branch "${branch.name}" has been created.`,
    type: "branch_update",
  });
};

export const notifyBranchUpdated = async (branch) => {
  const admins = await getAdminIds();
  const staff = await getBranchStaffIds(branch._id);

  await notifyUsers([...admins, ...staff], {
    title: "Branch Updated",
    message: `Branch "${branch.name}" information has been updated.`,
    type: "branch_update",
  });
};

export const notifyBranchStatusChanged = async (branch) => {
  const admins = await getAdminIds();
  const staff = await getBranchStaffIds(branch._id);

  await notifyUsers([...admins, ...staff], {
    title: `Branch ${branch.isActive ? "Activated" : "Deactivated"}`,
    message: `Branch "${branch.name}" has been ${
      branch.isActive ? "activated" : "deactivated"
    }.`,
    type: "branch_update",
  });
};

// Counter Notifications

export const notifyCounterCreated = async (counter) => {
  const admins = await getAdminIds();
  const branchId = counter.branch?._id || counter.branch;
  const staff = await getBranchStaffIds(branchId);

  await notifyUsers([...admins, ...staff], {
    title: "New Counter Created",
    message: `Counter "${counter.name}" has been created.`,
    type: "counter_update",
  });
};

export const notifyCounterUpdated = async (counter) => {
  const admins = await getAdminIds();
  const branchId = counter.branch?._id || counter.branch;
  const staff = await getBranchStaffIds(branchId);

  await notifyUsers(
    [
      ...admins,
      ...staff,
      counter.cashier?._id || counter.cashier,
    ],
    {
      title: "Counter Updated",
      message: `Counter "${counter.name}" information has been updated.`,
      type: "counter_update",
    }
  );
};

export const notifyCounterStatusChanged = async (counter) => {
  const admins = await getAdminIds();
  const branchId = counter.branch?._id || counter.branch;
  const staff = await getBranchStaffIds(branchId);

  await notifyUsers(
    [
      ...admins,
      ...staff,
      counter.cashier?._id || counter.cashier,
    ],
    {
      title: `Counter ${counter.isActive ? "Activated" : "Deactivated"}`,
      message: `Counter "${counter.name}" has been ${
        counter.isActive ? "activated" : "deactivated"
      }.`,
      type: "counter_update",
    }
  );
};