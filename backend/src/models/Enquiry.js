import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    message: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "replied", "closed"],
      default: "pending",
    },

    replyMessage: { type: String, default: "" },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
