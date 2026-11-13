
import { Router } from "express";

import authRoutes from "./auth.routes.js";
import branchRoutes from "./branch.routes.js";
import counterRoutes from "./counter.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/counters", counterRoutes);

export default router;
