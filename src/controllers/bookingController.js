import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  const { serviceId, name, phone, email, address, notes, scheduledAt } =
    req.body;

  if (!serviceId || !name || !phone || !address || !scheduledAt) {
    return res.status(400).json({
      message: "Missing required booking details",
    });
  }

  const booking = await Booking.create({
    service: serviceId,
    customer: req.user.id,
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    customerAddress: address,
    notes,
    scheduledAt,
    status: "CREATED",
  });

  res.status(201).json(booking);
};
