import mongoose from "mongoose";
import Category from "../models/Category.js";

/* ================= ADD CATEGORY ================= */
export const addCategory = async (req, res) => {
  try {
    let { name, subCategories = [], icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name required" });
    }

    name = name.trim();

    // normalize sub categories
    if (!Array.isArray(subCategories)) {
      return res.status(400).json({
        message: "subCategories must be an array",
      });
    }

    subCategories = subCategories
      .map((s) => s.trim())
      .filter(Boolean);

    const category = await Category.create({
      name,
      subCategories,
      icon,
    });

    res.status(201).json({
      success: true,
      category,
    });

  } catch (err) {
    console.error("ADD CATEGORY ERROR:", err);

    // 🔥 DUPLICATE KEY (name / slug)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];

      return res.status(409).json({
        message:
          field === "name"
            ? "Category already exists"
            : "Category slug already exists",
      });
    }

    res.status(500).json({
      message: "Failed to add category",
    });
  }
};

/* ================= GET CATEGORIES ================= */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("GET CATEGORY ERROR:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
};

/* ================= UPDATE CATEGORY ================= */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ success: true, category: updated });

  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate category name",
      });
    }

    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE CATEGORY ================= */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      success: true,
      message: "Category deleted",
    });

  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
