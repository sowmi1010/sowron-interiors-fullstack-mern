import mongoose from "mongoose";

const estimateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },

    city: String,
    homeType: String,
    budget: String,
    requirements: String,

    file: String,

    status: {
      type: String,
      enum: ["pending", "contacted", "quoted", "followup", "closed"],
      default: "pending",
    },

    notes: [
      {
        message: String,
        status: String,
        by: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    lastContactedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Estimate", estimateSchema);
