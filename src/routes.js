import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import testRoutes from "./modules/test/test.routes.js";
import serviceRoutes from "./modules/services/service.routes.js";
import bookingRoutes from "./modules/bookings/booking.routes.js";
import userRoutes from "./modules/users/user.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/test", testRoutes);
router.use("/services", serviceRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);

export default router;
