import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
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

    message: {
      type: String,
      trim: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portfolio",
      index: true,
    },
    projectTitle: {
      type: String,
      trim: true,
    },
    projectLocation: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "replied", "closed"],
      default: "pending",
      index: true,
    },

    replyMessage: {
      type: String,
      trim: true,
      default: "",
    },

    repliedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
