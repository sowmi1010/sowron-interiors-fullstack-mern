import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        public_id: String, // 🔥 REQUIRED for Cloudinary delete
      },
    ],
    video: {
      type: String, // optional
    },
  },
  { timestamps: true }
);

export default mongoose.model("Portfolio", portfolioSchema);
