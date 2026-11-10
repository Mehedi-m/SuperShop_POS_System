
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Session from "../models/session.model.js";

import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import { env } from "../config/env.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/token.js";

// Reusable error helper
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Remove password before returning user data
const sanitizeUser = (user) => {
  const userData = user.toObject();
  delete userData.password;

  return userData;
};

// 1. Initial Business + Admin Setup
const initialSetup = async (data) => {
  const {
    businessName,
    businessPhone,
    businessEmail,
    address,
    name,
    phone,
    email,
    password,
  } = data;

  // Check whether initial setup has already been completed
  const existingBusiness = await Business.findOne({
    instanceKey: "primary",
  });

  if (existingBusiness) {
    throw createError("Business setup has already been completed", 409);
  }

  // Check duplicate admin phone
  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw createError("This phone number is already registered", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    env.BCRYPT_SALT_ROUNDS
  );

  const session = await mongoose.startSession();

  let createdBusiness;
  let createdUser;

  try {
    await session.withTransaction(async () => {
      // Create Business
      createdBusiness = new Business({
        instanceKey: "primary",
        name: businessName,
        phone: businessPhone,
        email: businessEmail,
        address,
      });

      await createdBusiness.save({ session });

      // Create First Admin
      createdUser = new User({
        name,
        phone,
        email,
        password: hashedPassword,
        role: "admin",
        accountStatus: "approved",
        isActive: true,
        approvedAt: new Date(),
      });

      await createdUser.save({ session });
    });

    return {
      business: createdBusiness,
      user: sanitizeUser(createdUser),
    };
  } catch (error) {
    if (error.code === 11000) {
      throw createError(
        "Business setup or phone registration already exists",
        409
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// 2. New User Registration
const registerUser = async (data) => {
  const { name, phone, email, password } = data;

  // Check duplicate phone
  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw createError("This phone number is already registered", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    env.BCRYPT_SALT_ROUNDS
  );

  // Create pending user
  const user = await User.create({
    name,
    phone,
    email,
    password: hashedPassword,
    role: null,
    accountStatus: "pending",
    isActive: true,
  });

  return sanitizeUser(user);
};

// 3. Get Pending Users
const getPendingUsers = async () => {
  const users = await User.find({
    accountStatus: "pending",
  })
    .select("name phone email accountStatus createdAt")
    .sort({ createdAt: -1 });

  return users;
};

// 4. Approve User and Assign Role
const approveUser = async (userId, role, adminId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  if (user.accountStatus !== "pending") {
    throw createError("This account is not pending approval", 400);
  }

  user.role = role;
  user.accountStatus = "approved";
  user.approvedBy = adminId;
  user.approvedAt = new Date();

  await user.save();

  return sanitizeUser(user);
};

// 5. Reject User
const rejectUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  if (user.accountStatus !== "pending") {
    throw createError("This account is not pending approval", 400);
  }

  user.accountStatus = "rejected";

  await user.save();

  return sanitizeUser(user);
};

const loginUser = async (data, metadata = {}) => {
  const { phone, password } = data;

  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    throw createError("Invalid phone number or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw createError("Invalid phone number or password", 401);
  }

  if (user.accountStatus === "pending") {
    throw createError("Your account is waiting for admin approval", 403);
  }

  if (user.accountStatus === "rejected") {
    throw createError("Your registration has been rejected", 403);
  }

  if (!user.isActive) {
    throw createError("Your account is inactive", 403);
  }

  // Create session
  const session = await Session.create({
    user: user._id,
    refreshTokenHash: "temporary",
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    userAgent: metadata.userAgent || null,
    ipAddress: metadata.ipAddress || null,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user, session._id);

  const refreshToken = generateRefreshToken(user, session._id);

  // Store hashed refresh token
  session.refreshTokenHash = hashToken(refreshToken);

  await session.save();

  // Update last login
  user.lastLoginAt = new Date();

  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export {
  initialSetup,
  registerUser,
  getPendingUsers,
  approveUser,
  rejectUser,
  loginUser,
};
