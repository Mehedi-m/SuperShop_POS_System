
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Counter from "../models/counter.model.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Define which employees the logged-in user can access
const getEmployeeScope = async (currentUser) => {
  if (currentUser.role === "admin") {
    return {};
  }

  if (currentUser.role === "manager") {
    if (!currentUser.assignedBranch) {
      return { _id: null };
    }

    const counterIds = await Counter.distinct(" _id".trim(), {
      branch: currentUser.assignedBranch,
    });

    return {
      $or: [
        { assignedBranch: currentUser.assignedBranch },
        { assignedCounter: { $in: counterIds } },
      ],
    };
  }

  return { _id: null };
};

// Reusable employee population
const employeePopulation = [
  {
    path: "assignedBranch",
    select: "name code",
  },
  {
    path: "assignedCounter",
    select: "name code branch",
    populate: {
      path: "branch",
      select: "name code",
    },
  },
  {
    path: "approvedBy",
    select: "name",
  },
];

// Get employees with filters and pagination
export const getEmployees = async (currentUser, query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const filter = await getEmployeeScope(currentUser);

  // Managers can only see approved employees
  const status =
    currentUser.role === "admin"
      ? query.status || "approved"
      : "approved";

  if (status !== "all") {
    filter.accountStatus = status;
  }

  if (query.role) {
    const allowedRoles = [
      "admin",
      "manager",
      "inventory_manager",
      "cashier",
    ];

    if (!allowedRoles.includes(query.role)) {
      throw createError("Invalid employee role", 400);
    }

    filter.role = query.role;
  }

  if (query.isActive === "true") {
    filter.isActive = true;
  } else if (query.isActive === "false") {
    filter.isActive = false;
  }

  if (query.search?.trim()) {
    const search = query.search.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      },
    ];
  }

  const [employees, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .populate(employeePopulation)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get one employee
export const getEmployeeById = async (userId, currentUser) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid employee ID", 400);
  }

  const scope = await getEmployeeScope(currentUser);

  const filter = {
    _id: userId,
    ...scope,
  };

  if (currentUser.role !== "admin") {
    filter.accountStatus = "approved";
  }

  const employee = await User.findOne(filter)
    .select("-password")
    .populate(employeePopulation)
    .lean();

  if (!employee) {
    throw createError("Employee not found", 404);
  }

  return employee;
};
