import Service from "./service.model.js";
import Booking from "../bookings/booking.model.js";

/* ================= ADMIN ================= */

export const createService = async (req, res) => {
  try {
    const { name, category, icon, description, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        message: "Name, category and price are required",
      });
    }

    const service = await Service.create({
      name,
      category,
      icon: icon || "🛠️",
      description: description || "",
      price,
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("Create service error:", err);
    res.status(500).json({ message: "Failed to create service" });
  }
};

export const listAllServicesAdmin = async (req, res) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.json(services);
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, category, icon, description, price } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({
      message: "Name, category and price are required",
    });
  }

  const service = await Service.findById(id);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  service.name = name;
  service.category = category;
  service.icon = icon || service.icon;
  service.description = description || "";
  service.price = price;

  await service.save();
  res.json(service);
};

export const deleteService = async (req, res) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  const bookingCount = await Booking.countDocuments({
    service: serviceId,
  });

  if (bookingCount > 0) {
    return res.status(400).json({
      message:
        "This service has bookings. Complete or cancel them before deleting.",
    });
  }

  await Service.deleteOne({ _id: serviceId });
  res.json({ message: "Service deleted permanently" });
};

/* ================= PUBLIC ================= */

export const listServices = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({
    createdAt: -1,
  });
  res.json(services);
};

export const getPublicServices = async (req, res) => {
  const services = await Service.find({ isActive: true })
    .select("_id name price description icon category")
    .sort({ name: 1 });

  res.json(services);
};

export const getLandingPageData = async (req, res) => {
  try {
    const featuredServices = await Service.find({
      isActive: true,
      isFeatured: true,
    }).limit(6);

    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          services: {
            $push: {
              id: "$_id",
              name: "$name",
              icon: "$icon",
              price: "$price",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      featuredServices,
      categories,
      highlights: [
        "Trusted professionals",
        "On-time service",
        "Transparent pricing",
        "Verified technicians",
      ],
    });
  } catch (error) {
    console.error("Landing API error:", error);
    res.status(500).json({ message: "Landing page data error" });
  }
};
