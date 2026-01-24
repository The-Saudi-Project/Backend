import dotenv from "dotenv";
import cors from "cors";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

/* ---------- HEALTH CHECK (MUST BE FIRST) ---------- */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ---------- MIDDLEWARE ---------- */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://YOUR_VERCEL_APP.vercel.app"],
    credentials: true,
  }),
);

/* ---------- START SERVER FIRST ---------- */
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await connectDB();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
  }
});
