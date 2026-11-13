
import mongoose from "mongoose";
import Branch from "../models/branch.model.js";

const branchAccess = async (req, res, next) => {
  try {
    const branchId =
      req.params.branchId ||
      req.body.branchId ||
      req.query.branchId;

    if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing branch ID",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch || !branch.isActive) {
      return res.status(404).json({
        success: false,
        message: "Branch not found or inactive",
      });
    }

    if (req.user.role === "admin") {
      req.branch = branch;
      return next();
    }

    if (req.user.role === "manager") {
      if (
        !req.user.assignedBranch ||
        req.user.assignedBranch.toString() !== branchId
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this branch",
        });
      }

      req.branch = branch;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this branch",
    });
  } catch (error) {
    next(error);
  }
};

export default branchAccess;
