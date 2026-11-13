
import mongoose from "mongoose";
import Branch from "../models/branch.model.js";

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

export const createBranch = async (branchData) => {
  const existingBranch = await Branch.findOne({
    code: branchData.code.toUpperCase(),
  });

  if (existingBranch) {
    throw Object.assign(new Error("Branch code already exists"), {
      statusCode: 409,
    });
  }

  return await Branch.create({
    ...branchData,
    code: branchData.code.toUpperCase(),
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
