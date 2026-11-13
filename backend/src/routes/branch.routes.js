
import { Router } from "express";
import {
  getBranches,
  getBranch,
  createNewBranch,
  updateExistingBranch,
  changeBranchStatus,
} from "../controllers/branch.controller.js";

import {
  createBranchSchema,
  updateBranchSchema,
} from "../validations/branch.validation.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);

// Admin only
router.get(
  "/",
  authorizeRoles("admin"),
  asyncHandler(getBranches)
);

router.post(
  "/",
  authorizeRoles("admin"),
  validate(createBranchSchema),
  asyncHandler(createNewBranch)
);

router.get(
  "/:branchId",
  authorizeRoles("admin"),
  asyncHandler(getBranch)
);

router.patch(
  "/:branchId",
  authorizeRoles("admin"),
  validate(updateBranchSchema),
  asyncHandler(updateExistingBranch)
);

router.patch(
  "/:branchId/status",
  authorizeRoles("admin"),
  asyncHandler(changeBranchStatus)
);

export default router;
