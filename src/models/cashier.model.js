import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Counter code must be unique within a branch
counterSchema.index(
  { branch: 1, code: 1 },
  { unique: true }
);

// One cashier can be assigned to only one counter
counterSchema.index(
  { cashier: 1 },
  {
    unique: true,
    partialFilterExpression: {
      cashier: { $type: "objectId" },
    },
  }
);

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;