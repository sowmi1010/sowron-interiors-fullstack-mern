import Category from "../models/Category.js";

// ➕ Add category
export const addCategory = async (req, res) => {
  try {
    const { name, subCategories } = req.body;

    const category = await Category.create({
      name,
      subCategories: subCategories || [],
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📃 Get categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update
export const updateCategory = async (req, res) => {
  const updated = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// ❌ Delete
export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
