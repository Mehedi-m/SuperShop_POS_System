import mongoose from "mongoose";
import Counter from "../models/counter.model.js";

const authorizeCounterAccess = (req, res, next) => {
  const checkAccess = async () => {
    const counterId =
      req.params.counterId ||
      req.body.counterId ||
      req.query.counterId;

    if (!counterId || !mongoose.isValidObjectId(counterId)) {
      return res.status(400).json({
        success: false,
        message: "A valid counter ID is required",
      });
    }

    const counter = await Counter.findById(counterId);

    if (!counter || !counter.isActive) {
      return res.status(404).json({
        success: false,
        message: "Counter not found or inactive",
      });
    }

    const { role, assignedBranch, assignedCounter } = req.user;

    if (role === "admin" || role === "inventory_manager") {
      return next();
    }

    if (role === "manager") {
      if (assignedBranch?.toString() !== counter.branch.toString()) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this counter",
        });
      }

      return next();
    }

    if (role === "cashier") {
      if (assignedCounter?.toString() !== counter._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only access your assigned counter",
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Counter access denied",
    });
  };

  checkAccess().catch(next);
};

export default authorizeCounterAccess;