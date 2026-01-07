import express from "express";
import {
  addGallery,
  getGallery,
  getSingleGallery,
  updateGallery,
  deleteGallery,
} from "../controllers/galleryController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";
import Gallery from "../models/Gallery.js";

const router = express.Router();

/* 🌍 PUBLIC */
router.get("/", getGallery);

/* 🔐 ADMIN – LIST ALL (🔥 MUST BE BEFORE :id) */
router.get(
  "/admin",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const items = await Gallery.find().sort({ createdAt: -1 });
      res.json({ items });
    } catch (err) {
      console.error("ADMIN GALLERY LIST ERROR:", err);
      res.status(500).json({ message: "Failed to load gallery" });
    }
  }
);

/* 🌍 PUBLIC SINGLE */
router.get("/:id", getSingleGallery);

/* 🔐 ADMIN CRUD */
router.post(
  "/add",
  protect,
  adminOnly,
  getUploader("sowron-interiors/gallery").array("images", 8),
  addGallery
);

router.put(
  "/:id",
  protect,
  adminOnly,
  getUploader("sowron-interiors/gallery").array("images", 8),
  updateGallery
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteGallery
);

export default router;
