import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

/* ================= WISHLIST ================= */
router.get("/", protect, getWishlist);
router.post("/add/:productId", protect, addToWishlist);
router.delete("/remove/:productId", protect, removeFromWishlist);

export default router;
