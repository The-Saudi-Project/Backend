import express from "express";

const app = express();

app.use(express.json());

/* routes example */
import authRoutes from "./routes/auth.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);
app.use("/bookings", bookingRoutes);

export default app;
