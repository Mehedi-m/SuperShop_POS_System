import mongoose from "mongoose";
import Counter from "../models/counter.model.js";
import Branch from "../models/branch.model.js";

const authorizeBranchAccess = (req, res, next) => {
  const checkAccess = async () => {
    const branchId =
      req.params.branchId ||
      req.body.branchId ||
      req.query.branchId;

    if (!branchId || !mongoose.isValidObjectId(branchId)) {
      return res.status(400).json({
        success: false,
        message: "A valid branch ID is required",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch || !branch.isActive) {
      return res.status(404).json({
        success: false,
        message: "Branch not found or inactive",
      });
    }

    const { role, assignedBranch, assignedCounter } = req.user;

    // Admin and Inventory Manager can access all branches
    if (role === "admin" || role === "inventory_manager") {
      return next();
    }

    // Manager can access only assigned branch
    if (role === "manager") {
      if (assignedBranch?.toString() !== branchId) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this branch",
        });
      }

      return next();
    }

    // Cashier can access only the branch of their assigned counter
    if (role === "cashier") {
      if (!assignedCounter) {
        return res.status(403).json({
          success: false,
          message: "No counter is assigned to your account",
        });
      }

      const counter = await Counter.findById(assignedCounter);

      if (
        !counter ||
        !counter.isActive ||
        counter.branch.toString() !== branchId
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this branch",
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Branch access denied",
    });
  };

  checkAccess().catch(next);
};

export default authorizeBranchAccess;