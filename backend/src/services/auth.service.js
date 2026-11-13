
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import Session from "../models/session.model.js";
import Branch from "../models/branch.model.js";
import Counter from "../models/counter.model.js";

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

  const existingBusiness = await Business.findOne({
    instanceKey: "primary",
  });

  if (existingBusiness) {
    throw createError(
      "Business setup has already been completed",
      409
    );
  }

  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw createError(
      "This phone number is already registered",
      409
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    env.BCRYPT_SALT_ROUNDS
  );

  const session = await mongoose.startSession();

  let createdBusiness;
  let createdUser;

  try {
    await session.withTransaction(async () => {
      createdBusiness = new Business({
        instanceKey: "primary",
        name: businessName,
        phone: businessPhone,
        email: businessEmail,
        address,
      });

      await createdBusiness.save({ session });

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

  // Ensure initial business setup is completed
  const existingBusiness = await Business.findOne({
    instanceKey: "primary",
  });

  if (!existingBusiness) {
    throw createError(
      "Business setup has not been completed",
      400
    );
  }

  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw createError(
      "This phone number is already registered",
      409
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    env.BCRYPT_SALT_ROUNDS
  );

  const user = await User.create({
    name,
    phone,
    email,
    password: hashedPassword,
    role: null,
    assignedBranch: null,
    assignedCounter: null,
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
const approveUser = async (
  userId,
  { role, branchId, counterId },
  adminId
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user ID", 400);
  }

  // Admin and Inventory Manager require no assignment
  if (role === "admin" || role === "inventory_manager") {
    const user = await User.findById(userId);

    if (!user) {
      throw createError("User not found", 404);
    }

    if (user.accountStatus !== "pending") {
      throw createError(
        "This user is not pending approval",
        400
      );
    }

    user.role = role;
    user.assignedBranch = null;
    user.assignedCounter = null;
    user.accountStatus = "approved";
    user.approvedBy = adminId;
    user.approvedAt = new Date();

    await user.save();

    return sanitizeUser(user);
  }

  // Determine assignment ID
  const assignmentId =
    role === "manager" ? branchId : counterId;

  if (!mongoose.isValidObjectId(assignmentId)) {
    throw createError(
      "A valid assignment ID is required",
      400
    );
  }

  // Manager and Cashier assignments use transactions
  const session = await mongoose.startSession();

  let approvedUser = null;

  try {
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);

      if (!user) {
        throw createError("User not found", 404);
      }

      if (user.accountStatus !== "pending") {
        throw createError(
          "This user is not pending approval",
          400
        );
      }

      if (user.assignedBranch || user.assignedCounter) {
        throw createError(
          "This user already has an assignment",
          409
        );
      }

      // MANAGER APPROVAL
      if (role === "manager") {
        const branch = await Branch.findById(
          assignmentId
        ).session(session);

        if (!branch) {
          throw createError("Branch not found", 404);
        }

        if (!branch.isActive) {
          throw createError(
            "This branch is inactive",
            400
          );
        }

        // Atomically reserve the branch
        const updatedBranch = await Branch.findOneAndUpdate(
          {
            _id: assignmentId,
            isActive: true,
            manager: null,
          },
          {
            $set: { manager: user._id },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedBranch) {
          throw createError(
            "This branch already has a manager",
            409
          );
        }

        user.role = "manager";
        user.assignedBranch = updatedBranch._id;
        user.assignedCounter = null;
      }

      // CASHIER APPROVAL
      if (role === "cashier") {
        const counter = await Counter.findById(
          assignmentId
        ).session(session);

        if (!counter) {
          throw createError("Counter not found", 404);
        }

        if (!counter.isActive) {
          throw createError(
            "This counter is inactive",
            400
          );
        }

        // Check parent branch
        const branch = await Branch.findById(
          counter.branch
        ).session(session);

        if (!branch || !branch.isActive) {
          throw createError(
            "Counter's branch is unavailable or inactive",
            400
          );
        }

        // Atomically reserve the counter
        const updatedCounter = await Counter.findOneAndUpdate(
          {
            _id: assignmentId,
            isActive: true,
            cashier: null,
          },
          {
            $set: { cashier: user._id },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedCounter) {
          throw createError(
            "This counter already has a cashier",
            409
          );
        }

        user.role = "cashier";
        user.assignedCounter = updatedCounter._id;
        user.assignedBranch = null;
      }

      // Common approval information
      user.accountStatus = "approved";
      user.approvedBy = adminId;
      user.approvedAt = new Date();

      await user.save({ session });

      approvedUser = user;
    });

    return sanitizeUser(approvedUser);
  } catch (error) {
    if (error.code === 11000) {
      throw createError(
        "This assignment already exists",
        409
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

// 5. Reject User
const rejectUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid user ID", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  if (user.accountStatus !== "pending") {
    throw createError(
      "This account is not pending approval",
      400
    );
  }

  user.accountStatus = "rejected";

  await user.save();

  return sanitizeUser(user);
};

// 6. Login User
const loginUser = async (data, metadata = {}) => {
  const { phone, password } = data;

  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    throw createError(
      "Invalid phone number or password",
      401
    );
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw createError(
      "Invalid phone number or password",
      401
    );
  }

  if (user.accountStatus === "pending") {
    throw createError(
      "Your account is waiting for admin approval",
      403
    );
  }

  if (user.accountStatus === "rejected") {
    throw createError(
      "Your registration has been rejected",
      403
    );
  }

  if (!user.isActive) {
    throw createError(
      "Your account is inactive",
      403
    );
  }

  // 7. Refresh Access Token
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw createError("Refresh token is required", 401);
  }

  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    );
  } catch {
    throw createError(
      "Invalid or expired refresh token",
      401
    );
  }

  const { sub, sessionId } = decoded;

  if (!sub || !sessionId) {
    throw createError("Invalid refresh token", 401);
  }

  // Find valid session
  const session = await Session.findOne({
    _id: sessionId,
    user: sub,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
    refreshTokenHash: hashToken(refreshToken),
  });

  if (!session) {
    throw createError(
      "Session expired or revoked",
      401
    );
  }

  // Check user status
  const user = await User.findById(sub);

  if (
    !user ||
    user.accountStatus !== "approved" ||
    !user.isActive
  ) {
    throw createError(
      "Account is not authorized",
      403
    );
  }

  // Rotate refresh token
  const newRefreshToken = generateRefreshToken(
    user,
    session._id
  );

  const newAccessToken = generateAccessToken(
    user,
    session._id
  );

  // Atomic update prevents reuse of an old refresh token
  const updatedSession = await Session.findOneAndUpdate(
    {
      _id: session._id,
      refreshTokenHash: hashToken(refreshToken),
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        refreshTokenHash: hashToken(newRefreshToken),
      },
    },
    {
      new: true,
    }
  );

  if (!updatedSession) {
    throw createError(
      "Refresh token has already been used",
      401
    );
  }

  const userData = user.toObject();
  delete userData.password;

  return {
    user: userData,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


// Logout User
const logoutUser = async (sessionId) => {
  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
      },
    },
    {
      new: true,
    }
  );

  if (!session) {
    throw createError(
      "Session already revoked or not found",
      401
    );
  }

  return true;
};


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
  const accessToken = generateAccessToken(
    user,
    session._id
  );

  const refreshToken = generateRefreshToken(
    user,
    session._id
  );

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
  refreshAccessToken,
  logoutUser,
};
