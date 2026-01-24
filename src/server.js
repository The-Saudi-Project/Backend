import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5000;

/* ---------- CORS (must be BEFORE routes) ---------- */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://YOUR_VERCEL_APP.vercel.app"],
    credentials: true,
  }),
);

/* ---------- HEALTH CHECK (REQUIRED FOR RAILWAY) ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- START SERVER FIRST ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ---------- CONNECT DB AFTER SERVER START ---------- */
connectDB()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));
