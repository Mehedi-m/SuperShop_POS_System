import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Branch code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Branch address is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Branch phone is required"],
      trim: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    
    inventoryManager: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
    
    isMain: {
  type: Boolean,
  default: false,
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

branchSchema.index(
  { isMain: 1 },
  {
    unique: true,
    partialFilterExpression: { isMain: true },
  }
);

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;