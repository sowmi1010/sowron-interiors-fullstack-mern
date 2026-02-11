import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, trim: true },

    photo: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);
feedbackSchema.index({ createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);
