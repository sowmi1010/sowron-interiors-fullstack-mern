import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";

/* ================= GET WISHLIST ================= */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: { path: "category", select: "name slug" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 FIX: frontend expects ARRAY directly
    res.json(user.wishlist || []);
  } catch (err) {
    console.error("GET WISHLIST ERROR:", err);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
};

/* ================= ADD TO WISHLIST ================= */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!user.wishlist) user.wishlist = [];

    // 🔒 ObjectId-safe duplicate check
    if (user.wishlist.some((id) => id.equals(productId))) {
      return res.status(409).json({
        message: "Product already in wishlist",
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (err) {
    console.error("ADD WISHLIST ERROR:", err);
    res.status(500).json({ message: "Failed to add wishlist" });
  }
};

/* ================= REMOVE FROM WISHLIST ================= */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    user.wishlist = user.wishlist.filter(
      (id) => !id.equals(productId)
    );

    await user.save();

    res.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (err) {
    console.error("REMOVE WISHLIST ERROR:", err);
    res.status(500).json({ message: "Failed to remove wishlist" });
  }
};
