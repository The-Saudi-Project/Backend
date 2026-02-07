import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true, // e.g. "AC Services", "Cleaning"
      index: true,
    },

    icon: {
      type: String,
      required: true, // emoji for now
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      default: 0, // can be updated later
    },
    category: { type: String, required: true },
    icon: { type: String, default: "🛠️" },
    isFeatured: {
      type: Boolean,
      default: false, // landing page highlight
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Service", serviceSchema);
