import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
      index: true,
    },

    /**
     * Only used when role === "provider"
     * References services created by admin
     */
    servicesOffered: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    /**
     * Useful for:
     * - disabling providers
     * - soft-bans
     * - admin control
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

export default mongoose.model("User", userSchema);
