import express from "express";
import cors from "cors";

const app = express();

/* ---------- CORS (CRITICAL) ---------- */
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server & Postman
      if (!origin) return callback(null, true);

      // allow all vercel deployments + localhost
      if (origin.includes("vercel.app") || origin === "http://localhost:5173") {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ---------- BODY PARSER ---------- */
app.use(express.json());

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- ROUTES ---------- */
import authRoutes from "./modules/auth/auth.routes.js";
import serviceRoutes from "./modules/services/service.routes.js";
import bookingRoutes from "./modules/bookings/booking.routes.js";
import userRoutes from "./modules/users/user.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

export default app;
