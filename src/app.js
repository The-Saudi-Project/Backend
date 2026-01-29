import express from "express";
import cors from "cors";

const app = express();

/* ---------- CORS ---------- */
const allowedOrigins = [
  "http://localhost:5173",
  "https://thesaudiproject.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
