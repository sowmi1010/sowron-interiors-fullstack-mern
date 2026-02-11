import mongoose from "mongoose";

const estimateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      trim: true,
    },

    homeType: {
      type: String,
      trim: true,
    },

    budget: {
      type: String,
      trim: true,
    },

    requirements: {
      type: String,
      trim: true,
    },

    file: {
      type: String, // legacy filename
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    filePublicId: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "contacted", "quoted", "followup", "closed"],
      default: "pending",
      index: true,
    },

    notes: [
      {
        message: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
        },
        by: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    lastContactedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
estimateSchema.index({ createdAt: -1 });

export default mongoose.model("Estimate", estimateSchema);
