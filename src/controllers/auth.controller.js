
import {
  initialSetup,
  registerUser,
  getPendingUsers,
  approveUser,
  rejectUser,
  loginUser,
} from "../services/auth.service.js";

import { refreshCookieOptions } from "../utils/cookie.js";

// 1. Initial Business Setup
export const setupBusiness = async (req, res) => {
  const result = await initialSetup(req.body);

  return res.status(201).json({
    success: true,
    message: "Business and Admin account created successfully",
    data: result,
  });
};

// 2. User Registration
export const register = async (req, res) => {
  const user = await registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "Registration successful. Waiting for admin approval.",
    data: user,
  });
};

// 3. Get Pending Users
export const pendingUsers = async (req, res) => {
  const users = await getPendingUsers();

  return res.status(200).json({
    success: true,
    message: "Pending users retrieved successfully",
    data: users,
  });
};

// 4. Approve User
export const approve = async (req, res) => {
  const { role, branchId, counterId } = req.body;

  const user = await approveUser(
    req.params.userId,
    { role, branchId, counterId },
    req.user._id
  );

  return res.status(200).json({
    success: true,
    message: "User approved successfully",
    data: user,
  });
};

// 5. Reject User
export const reject = async (req, res) => {
  const user = await rejectUser(req.params.userId);

  return res.status(200).json({
    success: true,
    message: "User registration rejected successfully",
    data: user,
  });
};

// User Login
export const login = async (req, res) => {
  const result = await loginUser(req.body, {
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  });

  const { refreshToken, ...responseData } = result;

  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions
  );

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: responseData.user,
      accessToken: responseData.accessToken,
    },
  });
};
