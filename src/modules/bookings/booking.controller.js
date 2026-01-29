import Booking from "./booking.model.js";
import Service from "../services/service.model.js";
import User from "../users/user.model.js";

/* ================= CUSTOMER ================= */

export const createBooking = async (req, res) => {
  const { serviceId } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const booking = await Booking.create({
    service: serviceId,
    customer: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    customerPhone: "N/A",
    customerAddress: "Not provided",
    scheduledAt: new Date(),
  });

  res.status(201).json(booking);
};

export const getCustomerBookings = async (req, res) => {
  const bookings = await Booking.find({
    customer: req.user.id,
  })
    .populate("service", "name price")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

/* ================= PROVIDER ================= */

export const getProviderBookings = async (req, res) => {
  const bookings = await Booking.find({
    provider: req.user.id,
  })
    .populate("service", "name price")
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

export const acceptBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.status = "IN_PROGRESS";
  await booking.save();

  res.json(booking);
};

export const completeBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking.status = "COMPLETED";
  await booking.save();

  res.json(booking);
};

/* ================= ADMIN ================= */

export const getAllBookingsAdmin = async (req, res) => {
  const bookings = await Booking.find()
    .populate("service", "name")
    .populate("customer", "name email")
    .populate("provider", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

export const assignProvider = async (req, res) => {
  const { providerId } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const provider = await User.findById(providerId);
  if (!provider || provider.role !== "provider") {
    return res.status(400).json({ message: "Invalid provider" });
  }

  booking.provider = providerId;
  booking.status = "ASSIGNED";
  await booking.save();

  res.json(booking);
};
