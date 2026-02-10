import User from "../users/user.model.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "./auth.utils.js";
import jwt from "jsonwebtoken";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  const { name, email, password, role, services } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (
    role === "provider" &&
    (!Array.isArray(services) || services.length === 0)
  ) {
    return res.status(400).json({
      message: "Providers must select at least one service",
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
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

  res.status(201).json({ message: "Account created" });
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  const { email, password, expectedRole } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({
      message: `This account is not a ${expectedRole} account`,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  });
};

/* ================= REFRESH ================= */
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
