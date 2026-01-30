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
