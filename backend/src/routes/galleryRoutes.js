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

/* 🔐 ADMIN – LIST WITH SEARCH + PAGINATION */
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 9, q = "" } = req.query;

    const filter = q
      ? {
          title: { $regex: q, $options: "i" }, // case-insensitive search
        }
      : {};

    const items = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Gallery.countDocuments(filter);

    res.json({ items, total });
  } catch (err) {
    console.error("ADMIN GALLERY LIST ERROR:", err);
    res.status(500).json({ message: "Failed to load gallery" });
  }
});

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

router.delete("/:id", protect, adminOnly, deleteGallery);

export default router;
