
import { Router } from "express";

import {
  setupBusiness,
  register,
  pendingUsers,
  approve,
  reject,
  login,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

import {
  initialSetupSchema,
  registerSchema,
  loginSchema,
  approveUserSchema,
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

router.post("/refresh", asyncHandler(refresh));

// Admin Protected Routes

router.get(
  "/pending-users",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(pendingUsers)
);

router.patch(
  "/reject/:userId",
  authenticate,
  authorizeRoles("admin"),
  asyncHandler(reject)
);

router.patch(
  "/approve/:userId",
  authenticate,
  authorizeRoles("admin"),
  validate(approveUserSchema),
  asyncHandler(approve)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(getMe)
);

router.post(
  "/logout",
  authenticate,
  asyncHandler(logout)
);

export default router;
