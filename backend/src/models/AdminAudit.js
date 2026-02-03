import mongoose from "mongoose";

const adminAuditSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    success: {
      type: Boolean,
      default: true,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminAudit", adminAuditSchema);
