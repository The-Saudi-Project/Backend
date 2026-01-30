import express from "express";
import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import { listProviders } from "./user.controller.js";
import { listProvidersWithAvailability } from "./user.controller.js";
const router = express.Router();

router.get("/providers", authenticate, authorizeRoles("admin"), listProviders);
router.get(
  "/providers/availability",
  authenticate,
  authorizeRoles("admin"),
  listProvidersWithAvailability,
);
export default router;
