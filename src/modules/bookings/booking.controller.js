import Booking from "./booking.model.js";
import Service from "../services/service.model.js";
import User from "../users/user.model.js";

/* ================= CUSTOMER ================= */

export const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      scheduledAt,
      customerName,
      customerPhone,
      customerAddress,
      notes,
    } = req.body;

    if (
      !serviceId ||
      !scheduledAt ||
      !customerName ||
      !customerPhone ||
      !customerAddress
    ) {
      return res
        .status(400)
        .json({ message: "Missing required booking details" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const scheduledDate = new Date(scheduledAt);

    const clash = await Booking.findOne({
      service: serviceId,
      scheduledAt: scheduledDate,
      status: { $in: ["PENDING_PAY", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"] },
    });

    if (clash) {
      return res
        .status(409)
        .json({ message: "This time slot is already booked" });
    }

    const booking = await Booking.create({
      service: serviceId,
      serviceName: service.name,
      servicePrice: service.price,
      customer: req.user.id,
      customerName,
      customerPhone,
      customerEmail: req.user.email,
      customerAddress,
      notes: notes || "",
      scheduledAt: scheduledDate,
      status: "PENDING_PAY",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

export const getCustomerBookings = async (req, res) => {
  const bookings = await Booking.find({ customer: req.user.id })
    .populate("provider", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

/* ================= CUSTOMER CANCEL ================= */

export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.customer.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  if (["IN_PROGRESS", "COMPLETED", "EXPIRED"].includes(booking.status)) {
    return res.status(400).json({
      message: "This booking cannot be cancelled",
    });
  }

  booking.status = "CANCELLED";
  booking.cancelledAt = new Date();
  booking.cancelledBy = "customer";
  booking.provider = null;

  await booking.save();

  res.json({ message: "Booking cancelled", booking });
};

/* ================= PROVIDER ================= */

export const getProviderBookings = async (req, res) => {
  const bookings = await Booking.find({ provider: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(bookings);
};

export const startBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking || booking.status !== "ASSIGNED") {
    return res.status(400).json({ message: "Cannot start booking" });
  }

  booking.status = "IN_PROGRESS";
  await booking.save();

  res.json(booking);
};

export const completeBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking || booking.status !== "IN_PROGRESS") {
    return res.status(400).json({ message: "Cannot complete booking" });
  }

  booking.status = "COMPLETED";
  await booking.save();

  res.json(booking);
};

/* ================= ADMIN ================= */

export const getAllBookingsAdmin = async (req, res) => {
  const bookings = await Booking.find()
    .populate("service", "name price")
    .populate("customer", "name email")
    .populate("provider", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

export const assignProvider = async (req, res) => {
  const { providerId } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (["IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
    return res.status(400).json({ message: "Cannot change provider" });
  }

  const provider = await User.findById(providerId);
  if (!provider || provider.role !== "provider") {
    return res.status(400).json({ message: "Invalid provider" });
  }

  booking.provider = provider._id;
  booking.status = "ASSIGNED";
  await booking.save();

  res.json(booking);
};

/* ================= PAYMENT ================= */

export const uploadPaymentProof = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking || booking.status !== "PENDING_PAY") {
    return res.status(400).json({ message: "Payment not allowed" });
  }

  booking.paymentProof = req.file.filename;
  booking.status = "PAYMENT_UPLOADED";
  await booking.save();

  res.json({ message: "Payment proof uploaded" });
};

export const confirmPayment = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking || booking.status !== "PAYMENT_UPLOADED") {
    return res.status(400).json({ message: "No payment proof uploaded" });
  }

  booking.status = "CONFIRMED";
  booking.paymentConfirmedAt = new Date();
  await booking.save();

  res.json({ message: "Payment confirmed" });
};
