import express from "express";
import {
  addPortfolio,
  updatePortfolio,
  getPortfolio,
  deletePortfolio,
  getSinglePortfolio,
} from "../controllers/portfolioController.js";

import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/", getPortfolio);
router.get("/:id", getSinglePortfolio);

/* ================= ADMIN ================= */
router.post(
  "/add",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  getUploader("sowron-interiors/portfolio").array("images", 10),
  addPortfolio
);

router.put(
  "/:id",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  getUploader("sowron-interiors/portfolio").array("images", 10),
  updatePortfolio
);

router.delete(
  "/:id",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  deletePortfolio
);

export default router;
