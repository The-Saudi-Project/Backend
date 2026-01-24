import express from "express";
import router from "./router.js"; // 👈 IMPORTANT
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "thesaudiproject.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

// Health check (Railway NEEDS this)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount ALL routes
app.use(router);

export default app;
