
import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    instanceKey: {
      type: String,
      default: "primary",
      unique: true,
      immutable: true,
    },

    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    phone: {
      type: String,
      required: [true, "Business phone is required"],
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

currency: {
  type: String,
  default: "BDT",
  immutable: true,
},

timezone: {
  type: String,
  default: "Asia/Dhaka",
  immutable: true,
},

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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

const Business = mongoose.model("Business", businessSchema);

export default Business;
