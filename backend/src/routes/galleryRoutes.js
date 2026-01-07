import express from "express";
import {
  addGallery,
  getGallery,
  getSingleGallery,
  updateGallery,
  deleteGallery,
} from "../controllers/galleryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";

const router = express.Router();

// 🌍 PUBLIC
router.get("/", getGallery);
router.get("/item/:id", getSingleGallery);

// 🔐 ADMIN
router.post(
  "/add",
  protect,
  adminOnly,
  uploadCloudinary.array("images", 8),
  addGallery
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadCloudinary.array("images", 8),
  updateGallery
);

router.delete("/:id", protect, adminOnly, deleteGallery);

export default router;
