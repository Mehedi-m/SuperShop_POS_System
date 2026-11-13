
import mongoose from "mongoose";
import Counter from "../models/counter.model.js";
import Branch from "../models/branch.model.js";

export const getCountersByBranch = async (branchId) => {
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

  return await Counter.find({ branch: branchId })
    .populate("cashier", "name phone")
    .populate("branch", "name code")
    .sort({ createdAt: -1 });
};

export const createCounter = async (branchId, counterData) => {
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

  if (!branch.isActive) {
    throw Object.assign(new Error("Cannot create counter in an inactive branch"), {
      statusCode: 400,
    });
  }

  const existingCounter = await Counter.findOne({
    branch: branchId,
    code: counterData.code.toUpperCase(),
  });

  if (existingCounter) {
    throw Object.assign(new Error("Counter code already exists in this branch"), {
      statusCode: 409,
    });
  }

  return await Counter.create({
    ...counterData,
    branch: branchId,
    code: counterData.code.toUpperCase(),
  });
};

export const updateCounter = async (counterId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(counterId)) {
    throw Object.assign(new Error("Invalid counter ID"), {
      statusCode: 400,
    });
  }

  if (updateData.code) {
    updateData.code = updateData.code.toUpperCase();
  }

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("cashier", "name phone")
    .populate("branch", "name code");

  if (!counter) {
    throw Object.assign(new Error("Counter not found"), {
      statusCode: 404,
    });
  }

  return counter;
};

export const toggleCounterStatus = async (counterId) => {
  if (!mongoose.Types.ObjectId.isValid(counterId)) {
    throw Object.assign(new Error("Invalid counter ID"), {
      statusCode: 400,
    });
  }

  const counter = await Counter.findById(counterId);

  if (!counter) {
    throw Object.assign(new Error("Counter not found"), {
      statusCode: 404,
    });
  }

  counter.isActive = !counter.isActive;
  await counter.save();

  return counter;
};
