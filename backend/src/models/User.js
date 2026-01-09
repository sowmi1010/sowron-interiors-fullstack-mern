import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: String,
    city: String,

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    password: String,

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    otpHash: String,
    otpExpires: Date,
    otpAttempts: { type: Number, default: 0 },
    otpLockedUntil: Date,
    otpVerified: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Create reset token
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return rawToken;
};

export default mongoose.model("User", userSchema);
