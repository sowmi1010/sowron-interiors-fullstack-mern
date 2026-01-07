import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    city: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

/**
 * 🔒 Prevent double booking for active slots
 * MongoDB Atlas compatible
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

export default mongoose.model("Booking", bookingSchema);
