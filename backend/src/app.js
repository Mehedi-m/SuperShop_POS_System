
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import apiRoutes from "./routes/index.js";
import { env } from "./config/env.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Super Shop API is running",
    environment: env.NODE_ENV,
  });
});

// API routes
app.use("/api", apiRoutes);

export default app;
