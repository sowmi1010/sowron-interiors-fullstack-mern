import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: String,
    city: String,

    phone: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },


    password: String, // admin only
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

/* PASSWORD HASH */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* ADMIN PASSWORD CHECK */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/* 🔐 GENERATE RESET TOKEN */
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

  return rawToken;
};

export default mongoose.model("User", userSchema);
