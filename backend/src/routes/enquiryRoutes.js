import express from "express";
import {
  addEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import { publicFormLimiter } from "../middleware/rateLimit.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.post("/add", publicFormLimiter, addEnquiry);

/* ================= ADMIN ================= */
router.use(adminProtect, adminIpWhitelist, adminAudit);

router.get("/", getEnquiries);
router.patch("/:id", updateEnquiry);
router.delete("/:id", deleteEnquiry);

export default router;
