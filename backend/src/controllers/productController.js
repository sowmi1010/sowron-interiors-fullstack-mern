import mongoose from "mongoose";
import Product from "../models/Product.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";

/* ================= ADD PRODUCT ================= */
export const addProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedImages = [];

  try {
    const { title, description, category, subCategory, price } = req.body;

    if (!req.files?.length) {
      return res.status(400).json({ message: "Images required" });
    }

    uploadedImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    const [product] = await Product.create(
      [{
        title,
        description,
        category,
        subCategory,
        price,
        images: uploadedImages,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, product });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // 🔥 rollback cloudinary images
    await deleteMultipleImages(uploadedImages);

    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Product creation failed" });
  }
};

/* ================= GET PRODUCTS ================= */
export const getProducts = async (req, res) => {
  const products = await Product.find()
    .populate("category")
    .sort({ createdAt: -1 });

  res.json(products);
};

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(req.params.id).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Not found" });
    }

    let newImages = null;

    if (req.files?.length) {
      newImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));

      // 🔥 delete old images first
      const failed = await deleteMultipleImages(product.images);
      if (failed.length) {
        await session.abortTransaction();
        return res.status(500).json({
          message: "Old image delete failed",
          failed,
        });
      }

      product.images = newImages;
    }

    product.title = req.body.title ?? product.title;
    product.description = req.body.description ?? product.description;
    product.category = req.body.category ?? product.category;
    product.subCategory = req.body.subCategory ?? product.subCategory;
    product.price = req.body.price ?? product.price;

    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, product });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(req.params.id).session(session);
    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Not found" });
    }

    // 🔥 delete images FIRST
    const failed = await deleteMultipleImages(product.images);
    if (failed.length) {
      await session.abortTransaction();
      return res.status(500).json({
        message: "Image delete failed",
        failed,
      });
    }

    await product.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Product deleted" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
