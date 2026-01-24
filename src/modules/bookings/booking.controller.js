import Booking from "./booking.model.js";
import Service from "../services/service.model.js";
import User from "../users/user.model.js";
import { BOOKING_STATUS, ALLOWED_TRANSITIONS } from "./booking.rules.js";
/**
 * Customer: Create booking
 */
export const createBooking = async (req, res) => {
  const { serviceId, scheduledAt } = req.body;

  if (!serviceId || !scheduledAt) {
    return res.status(400).json({ message: "Service and time required" });
  }

  const service = await Service.findOne({ _id: serviceId, isActive: true });
  if (!service) {
    return res.status(404).json({
      message: "This service is no longer available for booking.",
    });
  }

  const booking = await Booking.create({
    customer: req.user.id,
    service: serviceId,
    scheduledAt,
  });

  res.status(201).json(booking);
};

/**
 * Admin: Assign provider to booking
 */
export const assignProvider = async (req, res) => {
  const { bookingId, providerId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== BOOKING_STATUS.CREATED) {
    return res.status(400).json({
      message: "Only newly created bookings can be assigned to a provider.",
    });
  }

  const provider = await User.findOne({
    _id: providerId,
    role: "provider",
  });

  if (!provider) {
    return res.status(404).json({ message: "Provider not found" });
  }

  booking.provider = providerId;
  booking.status = BOOKING_STATUS.ASSIGNED;

  await booking.save();

  res.json(booking);
};

/**
 * Provider: Update booking status
 */
export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (!booking.provider || booking.provider.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not your booking" });
  }

  const allowed = ALLOWED_TRANSITIONS[booking.status];

  if (!allowed.includes(status)) {
    return res.status(400).json({
      message: `You cannot change booking from ${booking.status} to ${status}.`,
    });
  }

  booking.status = status;
  await booking.save();

  res.json(booking);
};

/**
 * Admin: View all bookings
 */
export const listAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("customer", "name")
    .populate("provider", "name")
    .populate("service", "name");

  res.json(bookings);
};

/**
 * Provider: View assigned bookings
 */
export const listProviderBookings = async (req, res) => {
  const bookings = await Booking.find({ provider: req.user.id })
    .populate("service", "name price")
    .populate("customer", "name")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

/**
 * Customer: View own bookings
 */
export const listCustomerBookings = async (req, res) => {
  const bookings = await Booking.find({ customer: req.user.id })
    .populate("service", "name price")
    .sort({ createdAt: -1 });

  res.json(bookings);
};
