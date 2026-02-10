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
      return res.status(400).json({
        message: "Missing required booking details",
      });
    }

    const scheduledDate = new Date(scheduledAt);

    const clash = await Booking.findOne({
      service: serviceId,
      scheduledAt: scheduledDate,
      status: { $in: ["PENDING_PAY", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"] },
    });

    if (clash) {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    const booking = await Booking.create({
      service: serviceId,
      customer: req.user.id,
      customerName,
      customerPhone,
      customerAddress,
      customerEmail: req.user.email,
      notes: notes || "",
      scheduledAt: scheduledDate,
      status: "PENDING_PAY",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

export const getCustomerBookings = async (req, res) => {
  const bookings = await Booking.find({ customer: req.user.id })
    .populate("service", "name price")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

/* ================= PROVIDER ================= */

export const getProviderBookings = async (req, res) => {
  const bookings = await Booking.find({ provider: req.user.id })
    .populate("service", "name price")
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

export const startBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== "ASSIGNED") {
    return res.status(400).json({
      message: "Only assigned bookings can be started",
    });
  }

  booking.status = "IN_PROGRESS";
  booking.startedAt = new Date();
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
    .populate("service", "name price")
    .populate("customer", "name email")
    .populate("provider", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings);
};

export const assignProvider = async (req, res) => {
  const { providerId } = req.body;

  if (!providerId) {
    return res.status(400).json({ message: "providerId is required" });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (["IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
    return res.status(400).json({
      message: "Cannot change provider after job has started",
    });
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

export const getAvailableProviders = async (req, res) => {
  const { scheduledAt } = req.query;

  if (!scheduledAt) {
    return res.status(400).json({ message: "scheduledAt is required" });
  }

  const busy = await Booking.find({
    scheduledAt: new Date(scheduledAt),
    status: { $in: ["ASSIGNED", "IN_PROGRESS"] },
    provider: { $ne: null },
  }).select("provider");

  const busyIds = busy.map((b) => b.provider);

  const providers = await User.find({
    role: "provider",
    _id: { $nin: busyIds },
  }).select("_id name email");

  res.json(providers);
};

/* ================= PAYMENT ================= */

export const uploadPaymentProof = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== "PENDING_PAY") {
    return res.status(400).json({ message: "Payment already processed" });
  }

  booking.paymentProof = req.file.filename;
  booking.status = "PAYMENT_UPLOADED";
  await booking.save();

  res.json({ message: "Payment proof uploaded" });
};

export const confirmPayment = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== "PAYMENT_UPLOADED") {
    return res.status(400).json({ message: "No payment proof uploaded" });
  }

  booking.status = "CONFIRMED";
  booking.paymentConfirmedAt = new Date();
  await booking.save();

  res.json({ message: "Payment confirmed" });
};
