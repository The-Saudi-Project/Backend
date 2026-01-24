import User from "./user.model.js";

/**
 * Admin: List all providers
 */
export const listProviders = async (req, res) => {
  const providers = await User.find({ role: "provider" }).select("name email");
  res.json(providers);
};
