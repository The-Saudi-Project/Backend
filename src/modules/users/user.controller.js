import User from "./user.model.js";
import Booking from "../bookings/booking.model.js";
/**
 * Admin: List all providers
 */
export const listProviders = async (req, res) => {
  const providers = await User.find({ role: "provider" }).select("name email");
  res.json(providers);
};

/**
 * Admin: List providers with availability
 */
export const listProvidersWithAvailability = async (req, res) => {
  const providers = await User.find({ role: "provider" }).select("name email");

  const providerIds = providers.map((p) => p._id);

  const activeBookings = await Booking.find({
    provider: { $in: providerIds },
    status: { $in: ["ASSIGNED", "IN_PROGRESS"] },
  }).select("provider");

  const busyProviderIds = new Set(
    activeBookings.map((b) => b.provider.toString()),
  );

  const result = providers.map((p) => ({
    _id: p._id,
    name: p.name,
    email: p.email,
    available: !busyProviderIds.has(p._id.toString()),
  }));

  res.json(result);
};
/**
 * Admin: Get all providers with details
 */
export const getAllProviders = async (req, res) => {
  const providers = await User.find({ role: "provider" })
    .select("-password")
    .populate("services", "name");

  res.json(providers);
};
/**
 * Admin: Reset provider password
 */
export const resetProviderPassword = async (req, res) => {
  const provider = await User.findById(req.params.id);

  if (!provider || provider.role !== "provider") {
    return res.status(404).json({ message: "Provider not found" });
  }

  provider.forcePasswordReset = true;
  await provider.save();

  res.json({
    message:
      "Password reset enforced. Provider must set a new password on next login.",
  });
};
export const updateProviderStatus = async (req, res) => {
  const { active } = req.body;

  const provider = await User.findById(req.params.id);
  if (!provider || provider.role !== "provider") {
    return res.status(404).json({ message: "Provider not found" });
  }

  provider.isActive = active;
  await provider.save();

  res.json({
    message: `Provider ${active ? "activated" : "suspended"} successfully`,
  });
};
