
import { Router } from "express";

import { register } from "./auth.controller.js";
import { registerSchema } from "./auth.validation.js";
import validate from "../../middlewares/validate.middleware.js";

const router = Router();

// Business registration
router.post(
  "/register",
  validate(registerSchema),
  register
);

export default router;
