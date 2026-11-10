import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";

import { env } from "../config/env.js";

// Generate Access Token
export const generateAccessToken = (user, sessionId) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      sessionId: sessionId.toString(),
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      jwtid: randomUUID(),
    }
  );
};

// Generate Refresh Token
export const generateRefreshToken = (user, sessionId) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      sessionId: sessionId.toString(),
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      jwtid: randomUUID(),
    }
  );
};

// Hash Refresh Token
export const hashToken = (token) => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};