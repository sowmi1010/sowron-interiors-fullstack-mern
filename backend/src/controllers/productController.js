import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

/* ➕ ADD PRODUCT */
export const addProduct = async (req, res) => {
  try {
    const { title, description, category, subCategory, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images required" });
    }

    const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    const product = await Product.create({
      title,
      description,
      category,
      subCategory,
      price,
      images,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* 📃 GET PRODUCTS */
export const getProducts = async (req, res) => {
  const products = await Product.find()
    .populate("category")
    .sort({ createdAt: -1 });

  res.json(products);
};

/* ✏️ UPDATE PRODUCT */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    // 🧹 delete old images if new uploaded
    if (req.files && req.files.length > 0) {
      for (const img of product.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      product.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.subCategory = req.body.subCategory || product.subCategory;
    product.price = req.body.price || product.price;

    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ❌ DELETE PRODUCT */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
