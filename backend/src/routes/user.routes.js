
import { Router } from "express";

import {
  getAllEmployees,
  getSingleEmployee,
} from "../controllers/user.controller.js";

import authenticate from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);

// Admin and Branch Manager
router.get(
  "/",
  authorizeRoles("admin", "manager"),
  asyncHandler(getAllEmployees)
);

router.get(
  "/:userId",
  authorizeRoles("admin", "manager"),
  asyncHandler(getSingleEmployee)
);

export default router;
