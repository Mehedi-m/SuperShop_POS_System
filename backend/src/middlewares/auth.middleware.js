
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import { env } from "../config/env.js";

const authenticate = async (req, res, next) => {
  try {
    // 1. Get access token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET
    );

    // 3. Validate token payload
    if (
      !decoded.sub ||
      !decoded.sessionId ||
      !mongoose.isValidObjectId(decoded.sub) ||
      !mongoose.isValidObjectId(decoded.sessionId)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token payload",
      });
    }

    // 4. Find authenticated user
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. Check account approval
    if (user.accountStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved",
      });
    }

    // 6. Check account active status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // 7. Validate session
    const session = await Session.findOne({
      _id: decoded.sessionId,
      user: decoded.sub,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or revoked. Please login again.",
      });
    }

    // 8. Attach authenticated user and session
    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    next(error);
  }
};

export default authenticate;
