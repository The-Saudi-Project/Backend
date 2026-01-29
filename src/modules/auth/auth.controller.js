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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Explicitly select passwordHash (select: false in model)
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+passwordHash");

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
};
