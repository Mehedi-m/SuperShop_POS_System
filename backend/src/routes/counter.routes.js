
import { Router } from "express";

import {
  getCounters,
  createNewCounter,
  updateExistingCounter,
  changeCounterStatus,
} from "../controllers/counter.controller.js";

import {
  createCounterSchema,
  updateCounterSchema,
} from "../validations/counter.validation.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import branchAccess from "../middlewares/branch-access.middleware.js";
import counterAccess from "../middlewares/counter-access.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);

// Get counters by branch
router.get(
  "/branch/:branchId",
  authorizeRoles("admin", "manager"),
  branchAccess,
  asyncHandler(getCounters)
);

// Create counter inside a branch
router.post(
  "/branch/:branchId",
  authorizeRoles("admin", "manager"),
  branchAccess,
  validate(createCounterSchema),
  asyncHandler(createNewCounter)
);

// Update counter
router.patch(
  "/:counterId",
  authorizeRoles("admin", "manager"),
  counterAccess,
  validate(updateCounterSchema),
  asyncHandler(updateExistingCounter)
);

// Activate / Deactivate counter
router.patch(
  "/:counterId/status",
  authorizeRoles("admin", "manager"),
  counterAccess,
  asyncHandler(changeCounterStatus)
);

export default router;
