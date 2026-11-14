
import mongoose from "mongoose";
import Branch from "../models/branch.model.js";
import User from "../models/user.model.js";
import Counter from "../models/counter.model.js";

export const getAllBranches = async () => {
  return await Branch.find()
    .populate("manager", "name phone")
    .sort({ createdAt: -1 });
};

export const getBranchById = async (branchId) => {
  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw Object.assign(new Error("Invalid branch ID"), {
      statusCode: 400,
    });
  }

  const branch = await Branch.findById(branchId)
    .populate("manager", "name phone");

  if (!branch) {
    throw Object.assign(new Error("Branch not found"), {
      statusCode: 404,
    });
  }

  return branch;
};

export const getAccessibleBranches = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(new Error("User not found"), {
      statusCode: 404,
    });
  }

  // Admin: All active branches
  if (user.role === "admin") {
    return await Branch.find({ isActive: true })
      .populate("manager", "name phone")
      .populate("inventoryManager", "name phone")
      .sort({ isMain: -1, createdAt: 1 });
  }

  // Manager / Inventory Manager: Assigned branch
  if (
    user.role === "manager" ||
    user.role === "inventory_manager"
  ) {
    if (!user.assignedBranch) {
      return [];
    }

    const branch = await Branch.findOne({
      _id: user.assignedBranch,
      isActive: true,
    })
      .populate("manager", "name phone")
      .populate("inventoryManager", "name phone");

    return branch ? [branch] : [];
  }

  // Cashier: Branch assigned to their counter
  if (user.role === "cashier") {
    if (!user.assignedCounter) {
      return [];
    }

    const counter = await Counter.findOne({
      _id: user.assignedCounter,
      isActive: true,
    }).populate({
      path: "branch",
      match: { isActive: true },
    });

    return counter?.branch ? [counter.branch] : [];
  }

  return [];
};

export const createBranch = async (branchData) => {
  const existingBranch = await Branch.findOne({
    code: branchData.code.toUpperCase(),
  });

  if (existingBranch) {
    throw Object.assign(new Error("Branch code already exists"), {
      statusCode: 409,
    });
  }

  const isFirstBranch = (await Branch.countDocuments()) === 0;

  return await Branch.create({
    ...branchData,
    code: branchData.code.toUpperCase(),
    isMain: isFirstBranch,
  });
};

export const updateBranch = async (branchId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw Object.assign(new Error("Invalid branch ID"), {
      statusCode: 400,
    });
  }

  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  const branch = await Branch.findByIdAndUpdate(
    branchId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  ).populate("manager", "name phone");

  if (!branch) {
    throw Object.assign(new Error("Branch not found"), {
      statusCode: 404,
    });
  }

  return branch;
};

export const toggleBranchStatus = async (branchId) => {
  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw Object.assign(new Error("Invalid branch ID"), {
      statusCode: 400,
    });
  }

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw Object.assign(new Error("Branch not found"), {
      statusCode: 404,
    });
  }

  branch.isActive = !branch.isActive;
  await branch.save();

  return branch;
};
