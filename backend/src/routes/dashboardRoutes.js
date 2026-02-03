import express from "express";
import { getDashboardCounts } from "../controllers/adminDashboardController.js";
import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";

const router = express.Router();

/* ================= ADMIN DASHBOARD ================= */
router.get(
  "/counts",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  getDashboardCounts
);

export default router;
