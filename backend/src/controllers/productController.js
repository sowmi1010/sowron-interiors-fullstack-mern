import mongoose from "mongoose";
import Product from "../models/Product.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";

/* ================= ADD PRODUCT ================= */
export const addProduct = async (req, res) => {
  let uploadedImages = [];

  try {
    const { title, description, category, subCategory, price } = req.body;

    if (!title || !category || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.files?.length) {
      return res.status(400).json({ message: "Images required" });
    }

    uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const product = await Product.create({
      title,
      description,
      category,
      subCategory,
      price,
      images: uploadedImages,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    if (uploadedImages.length) {
      await deleteMultipleImages(uploadedImages);
    }

    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Product creation failed" });
  }
};

/* ================= GET PRODUCTS (PUBLIC + FILTER) ================= */
export const getProducts = async (req, res) => {
  try {
    const { category, subCategory, minPrice, maxPrice } = req.query;

    const filter = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    if (subCategory) {
      filter.subCategory = subCategory;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to load products" });
  }
};

/* ================= GET SINGLE PRODUCT ================= */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.files?.length) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      await deleteMultipleImages(product.images);
      product.images = newImages;
    }

    product.title = req.body.title ?? product.title;
    product.description = req.body.description ?? product.description;
    product.category = req.body.category ?? product.category;
    product.subCategory = req.body.subCategory ?? product.subCategory;
    product.price = req.body.price ?? product.price;

    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await deleteMultipleImages(product.images);
    await product.deleteOne();

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
