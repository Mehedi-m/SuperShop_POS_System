
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  toggleBranchStatus,
} from "../services/branch.service.js";

export const getBranches = async (req, res) => {
  const branches = await getAllBranches();

  res.status(200).json({
    success: true,
    data: branches,
  });
};

export const getBranch = async (req, res) => {
  const branch = await getBranchById(req.params.branchId);

  res.status(200).json({
    success: true,
    data: branch,
  });
};

export const createNewBranch = async (req, res) => {
  const branch = await createBranch(req.body);

  res.status(201).json({
    success: true,
    message: "Branch created successfully",
    data: branch,
  });
};

export const updateExistingBranch = async (req, res) => {
  const branch = await updateBranch(
    req.params.branchId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Branch updated successfully",
    data: branch,
  });
};

export const changeBranchStatus = async (req, res) => {
  const branch = await toggleBranchStatus(req.params.branchId);

  res.status(200).json({
    success: true,
    message: "Branch status updated successfully",
    data: branch,
  });
};
