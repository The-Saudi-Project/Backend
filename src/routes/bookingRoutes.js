import express from "express";
import { createBooking } from "../controllers/bookingController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("customer"), createBooking);

export default router;
