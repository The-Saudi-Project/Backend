import express from "express";
import {
  createBooking,
  assignProvider,
  updateBookingStatus,
  listAllBookings,
  listProviderBookings,
  listCustomerBookings,
} from "./booking.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Customer
router.post("/", authenticate, authorizeRoles("customer"), createBooking);
router.get(
  "/my",
  authenticate,
  authorizeRoles("customer"),
  listCustomerBookings,
);

// Admin
router.get("/", authenticate, authorizeRoles("admin"), listAllBookings);
router.post("/assign", authenticate, authorizeRoles("admin"), assignProvider);

// Provider
router.get(
  "/provider",
  authenticate,
  authorizeRoles("provider"),
  listProviderBookings,
);

router.post(
  "/status",
  authenticate,
  authorizeRoles("provider"),
  updateBookingStatus,
);
router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles("admin"),
  assignProvider,
);
export default router;
