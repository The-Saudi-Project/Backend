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
  const { firstName, lastName, email, password, role } = req.body;

  // Basic required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: "First name, last name, email and password are required.",
    });
  }

  // Password rules
  if (!isValidPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include a letter and a number.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check existing user
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists.",
    });
  }

  const passwordHash = await hashPassword(password);

  // Role safety: only allow customer or provider from public signup
  const safeRole = role === "provider" ? "provider" : "customer";

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash,
    role: safeRole,
  });

  const token = generateToken(user);

  res.status(201).json({
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
