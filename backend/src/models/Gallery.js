import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    category: {
      type: String,
      required: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    description: String,

    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
