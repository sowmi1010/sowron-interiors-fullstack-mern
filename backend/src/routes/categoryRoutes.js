import express from "express";
import {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} from "../controllers/categoryController.js";

import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/", getCategories);

/* ================= ADMIN ================= */
router.post(
  "/",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  addCategory
);
router.put(
  "/:id",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  updateCategory
);
router.delete(
  "/:id",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  deleteCategory
);

export default router;
