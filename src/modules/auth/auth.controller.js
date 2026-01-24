import User from "../users/user.model.js";
import { hashPassword, comparePassword, generateToken } from "./auth.utils.js";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
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

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
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
