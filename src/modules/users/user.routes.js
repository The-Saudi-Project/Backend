import express from "express";
import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import { listProviders } from "./user.controller.js";

const router = express.Router();

router.get("/providers", authenticate, authorizeRoles("admin"), listProviders);

export default router;
