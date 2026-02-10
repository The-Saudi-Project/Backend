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

    // 🔒 SLOT LOCK — BLOCK DOUBLE BOOKINGS
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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // ⏱ 10 min lock
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
  try {
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({
        message: "providerId is required",
      });
    }

    // 1️⃣ Find booking
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // 2️⃣ Prevent reassignment after job started
    if (booking.status === "IN_PROGRESS" || booking.status === "COMPLETED") {
      return res.status(400).json({
        message: "Cannot change provider after job has started",
      });
    }

    // 3️⃣ Find provider (THIS WAS THE BUG)
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(400).json({
        message: "Invalid provider",
      });
    }

    // 4️⃣ Check provider availability
    const clash = await Booking.findOne({
      provider: providerId,
      scheduledAt: booking.scheduledAt,
      status: { $in: ["CREATED", "ASSIGNED", "IN_PROGRESS"] },
      _id: { $ne: booking._id },
    });

    if (clash) {
      return res.status(400).json({
        message: "Provider is busy at this time",
      });
    }

    // 5️⃣ Assign provider
    booking.provider = provider._id;
    booking.status = "ASSIGNED";
    await booking.save();

    res.json({
      message: "Provider assigned successfully",
      booking,
    });
  } catch (error) {
    console.error("Assign provider error:", error);
    res.status(500).json({
      message: "Failed to assign provider",
    });
  }
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

export const startBooking = async (req, res) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // Only assigned bookings can be started
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
