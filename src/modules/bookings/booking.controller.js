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

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const booking = await Booking.create({
      service: serviceId,
      customer: req.user.id,
      customerName,
      customerPhone,
      customerAddress,
      customerEmail: req.user.email,
      notes: notes || "",
      scheduledAt: new Date(scheduledAt),
      status: "CREATED",
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      message: "Failed to create booking",
    });
  }
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

  if (booking.status === "IN_PROGRESS") {
    return res.status(400).json({
      message: "Cannot reassign provider once job has started",
    });
  }

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
export const getAvailableProviders = async (req, res) => {
  const { scheduledAt } = req.query;

  if (!scheduledAt) {
    return res.status(400).json({ message: "scheduledAt is required" });
  }

  const start = new Date(scheduledAt);
  const end = new Date(start);
  end.setHours(end.getHours() + 1); // 1-hour slot

  // Providers who are busy in this time window
  const busyBookings = await Booking.find({
    scheduledAt: {
      $gte: start,
      $lt: end,
    },
    status: { $in: ["CREATED", "ASSIGNED", "IN_PROGRESS"] },
    provider: { $ne: null },
  }).select("provider");

  const busyProviderIds = busyBookings.map((b) => b.provider.toString());

  // Providers NOT busy
  const availableProviders = await User.find({
    role: "provider",
    _id: { $nin: busyProviderIds },
  }).select("_id name email");

  res.json(availableProviders);
};
