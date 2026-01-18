import User from "../models/User.js";
import Product from "../models/Product.js";

/* ================= GET WISHLIST ================= */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: "Failed to load wishlist" });
  }
};

/* ================= ADD TO WISHLIST ================= */
export const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to add wishlist" });
  }
};

/* ================= REMOVE FROM WISHLIST ================= */
export const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;

    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove wishlist" });
  }
};
