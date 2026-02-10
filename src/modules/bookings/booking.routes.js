import express from "express";
import {
  createBooking,
  getCustomerBookings,
  cancelBooking,
  getProviderBookings,
  startBooking,
  completeBooking,
  getAllBookingsAdmin,
  assignProvider,
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

router.post("/", authenticate, authorizeRoles("customer"), createBooking);

router.get(
  "/customer",
  authenticate,
  authorizeRoles("customer"),
  getCustomerBookings,
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles("customer"),
  cancelBooking,
);

/* ================= PROVIDER ================= */

router.get(
  "/provider",
  authenticate,
  authorizeRoles("provider"),
  getProviderBookings,
);

router.patch(
  "/:id/start",
  authenticate,
  authorizeRoles("provider"),
  startBooking,
);

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("provider"),
  completeBooking,
);

/* ================= ADMIN ================= */

router.get("/", authenticate, authorizeRoles("admin"), getAllBookingsAdmin);

router.patch(
  "/:id/assign",
  authenticate,
  authorizeRoles("admin"),
  assignProvider,
);

router.patch(
  "/:id/confirm-payment",
  authenticate,
  authorizeRoles("admin"),
  confirmPayment,
);

/* ================= PAYMENT ================= */

router.post(
  "/:id/payment-proof",
  authenticate,
  authorizeRoles("customer"),
  uploadPayment.single("proof"),
  uploadPaymentProof,
);

export default router;
