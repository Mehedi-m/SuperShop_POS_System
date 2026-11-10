
import { Router } from "express";

import {
  setupBusiness,
  register,
  pendingUsers,
  approve,
  reject,
  login,
} from "../controllers/auth.controller.js";

import {
  initialSetupSchema,
  registerSchema,
  loginSchema,
} from "../validations/auth.validation.js";

import validate from "../middlewares/validate.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

// Public Routes

router.post(
  "/setup",
  validate(initialSetupSchema),
  asyncHandler(setupBusiness)
);

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(login)
);

// Admin Protected Routes

router.get(
  "/pending-users",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(pendingUsers)
);

router.patch(
  "/approve/:userId",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(approve)
);

router.patch(
  "/reject/:userId",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(reject)
);

export default router;
