import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // 🔥 REQUIRED FOR PRODUCT FORM
    subCategories: {
      type: [String],
      default: [],
    },

    icon: String, // optional (future)
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
