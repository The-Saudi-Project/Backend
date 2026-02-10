import express from "express";
import {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getAllBookingsAdmin,
  assignProvider,
  completeBooking,
  getAvailableProviders,
  startBooking,
  uploadPaymentProof,
  confirmPayment,
} from "./booking.controller.js";

import { uploadPayment } from "../../middlewares/upload.middleware.js";
import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= CUSTOMER ================= */

// Create booking
router.post("/", authenticate, authorizeRoles("customer"), createBooking);

// Customer bookings
router.get(
  "/customer",
  authenticate,
  authorizeRoles("customer"),
  getCustomerBookings,
);

/* ================= PROVIDER ================= */

// Provider assigned jobs
router.get(
  "/provider",
  authenticate,
  authorizeRoles("provider"),
  getProviderBookings,
);

// Provider starts job
router.patch(
  "/:id/start",
  authenticate,
  authorizeRoles("provider"),
  startBooking,
);

// Provider completes job
router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("provider"),
  completeBooking,
);

/* ================= ADMIN ================= */

// All bookings
router.get("/", authenticate, authorizeRoles("admin"), getAllBookingsAdmin);

// Assign or change provider
router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles("admin"),
  assignProvider,
);

// Available providers
router.get(
  "/available-providers",
  authenticate,
  authorizeRoles("admin"),
  getAvailableProviders,
);

// Confirm payment
router.patch(
  "/:id/confirm-payment",
  authenticate,
  authorizeRoles("admin"),
  confirmPayment,
);

/* ================= PAYMENT ================= */

// Upload payment proof
router.post(
  "/:id/payment-proof",
  authenticate,
  authorizeRoles("customer"),
  uploadPayment.single("proof"),
  uploadPaymentProof,
);

export default router;
