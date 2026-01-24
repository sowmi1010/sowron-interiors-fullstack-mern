import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true, // 🔥 important for filter
    },

    subCategory: {
      type: String,
      trim: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
