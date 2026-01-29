import Service from "./service.model.js";
import Booking from "../bookings/booking.model.js";

/**
 * Admin: Create a new service
 */
export const createService = async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  const service = await Service.create({
    name,
    description,
    price,
  });

  res.status(201).json(service);
};

/**
 * Public: List all active services
 */
export const listServices = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({
    createdAt: -1,
  });

  res.json(services);
};

/**
 * Admin: List all services (active + inactive)
 */
export const listAllServicesAdmin = async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.json(services);
};

/**
 * Admin: Delete service (hard delete)s
 */
export const deleteService = async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  // SAFETY CHECK: prevent deleting services with bookings
  const bookingCount = await Booking.countDocuments({
    service: serviceId,
  });

  if (bookingCount > 0) {
    return res.status(400).json({
      message:
        "This job has active bookings. Complete or cancel them before deleting.",
    });
  }

  await Service.deleteOne({ _id: serviceId });

  res.json({ message: "Service deleted permanently" });
};

//Edit service
export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      message: "Name and price are required",
    });
  }

  const service = await Service.findById(id);

  if (!service) {
    return res.status(404).json({
      message: "Service not found",
    });
  }

  service.name = name;
  service.price = price;
  service.description = description || "";

  await service.save();

  res.json(service);
};
