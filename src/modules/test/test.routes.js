import express from "express";
import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/admin-only", authenticate, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome admin",
    user: req.user,
  });
});

router.get("/any-user", authenticate, (req, res) => {
  res.json({
    message: "Authenticated user",
    user: req.user,
  });
});

export default router;
