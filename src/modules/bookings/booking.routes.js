import express from "express";
import {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getAllBookingsAdmin,
  assignProvider,
  acceptBooking,
  completeBooking,
  getAvailableProviders,
} from "./booking.controller.js";

import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= CUSTOMER ================= */

router.get(
  "/customer",
  authenticate,
  authorizeRoles("customer"),
  getCustomerBookings,
);

router.post("/", authenticate, authorizeRoles("customer"), createBooking);

/* ================= PROVIDER ================= */

router.get(
  "/provider",
  authenticate,
  authorizeRoles("provider"),
  getProviderBookings,
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
  "/:id/accept",
  authenticate,
  authorizeRoles("provider"),
  acceptBooking,
);

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("provider"),
  completeBooking,
);
router.get(
  "/available-providers",
  authenticate,
  authorizeRoles("admin"),
  getAvailableProviders,
);

router.post("/", authenticate, authorizeRoles("customer"), createBooking);

export default router;
