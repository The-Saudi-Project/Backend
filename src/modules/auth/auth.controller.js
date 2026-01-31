import User from "../users/user.model.js";
import { hashPassword, comparePassword, generateToken } from "./auth.utils.js";

/**
 * Helpers
 */
const isValidPassword = (password) => {
  // min 8 chars, at least 1 letter and 1 number
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
};

/**
 * REGISTER
 */
export const register = async (req, res) => {
  const { name, email, password, role, services } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 🔐 Provider validation
  if (role === "provider") {
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        message: "Providers must select at least one service",
      });
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "customer",
    services: role === "provider" ? services : [],
  });

  const token = generateToken(user);

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  });
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.forcePasswordReset) {
    return res.status(403).json({
      code: "FORCE_PASSWORD_RESET",
      message: "Password reset required",
    });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // ✅ ROLE ENFORCEMENT
  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({
      message: `This account is not a ${expectedRole} account`,
    });
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  });
};
export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);

  user.password = await bcrypt.hash(newPassword, 10);
  user.forcePasswordReset = false;

  await user.save();

  res.json({ message: "Password updated successfully" });
};
