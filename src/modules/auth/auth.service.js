
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "node:crypto";

import Business from "../businesses/business.model.js";
import User from "../users/user.model.js";
import { env } from "../../config/env.js";

// Generate a unique business slug
const generateSlug = (businessName) => {
  const baseSlug = businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = crypto.randomBytes(3).toString("hex");

  return `${baseSlug}-${suffix}`;
};

// Business registration service
const registerBusiness = async (data) => {
  const { businessName, name, email, password, phone, address } = data;

  // Check existing email
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash password before starting transaction
  const hashedPassword = await bcrypt.hash(
    password,
    env.BCRYPT_SALT_ROUNDS
  );

  const session = await mongoose.startSession();

  let createdBusiness;
  let createdUser;

  try {
    await session.withTransaction(async () => {
      // Create business
      createdBusiness = new Business({
        name: businessName,
        slug: generateSlug(businessName),
        email,
        phone,
        address,
      });

      await createdBusiness.save({ session });

      // Create business owner as admin
      createdUser = new User({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        tenantId: createdBusiness._id,
      });

      await createdUser.save({ session });
    });

    // Remove password before returning user data
    const userData = createdUser.toObject();
    delete userData.password;

    return {
      business: createdBusiness,
      user: userData,
    };
  } catch (error) {
    // Handle duplicate unique fields
    if (error.code === 11000) {
      const duplicateError = new Error(
        "Email or business slug already exists"
      );

      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export { registerBusiness };
