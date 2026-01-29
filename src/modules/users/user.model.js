import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    passwordHash: {
      type: String,
      required: true,
      select: false, // 🔐 NEVER return password hash
    },

    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
      immutable: true, // 🔒 role cannot be changed once set
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
