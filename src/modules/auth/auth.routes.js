import express from "express";
import { register, login } from "./auth.controller.js";
import { me } from "./auth.me.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);

export default router;
