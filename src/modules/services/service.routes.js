import express from "express";
import {
  createService,
  listServices,
  deleteService,
  listAllServicesAdmin,
} from "./service.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", listServices);

// Admin
router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  listAllServicesAdmin,
);

router.post("/", authenticate, authorizeRoles("admin"), createService);

router.delete(
  "/:serviceId",
  authenticate,
  authorizeRoles("admin"),
  deleteService,
);

export default router;
