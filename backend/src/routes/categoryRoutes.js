import express from "express";
import { addCategory, getCategories, deleteCategory, updateCategory} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategories);              // public
router.post("/", protect, adminOnly, addCategory); // admin
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;
