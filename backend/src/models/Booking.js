import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    time: {
      type: String, // HH:mm
      required: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * 🔒 Prevent double booking (Atlas compatible)
 * Only active slots are locked
 */
bookingSchema.index(
  { date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "confirmed"] },
    },
  }
);
bookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);
