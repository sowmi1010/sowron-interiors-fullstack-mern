import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

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
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "Invalid phone number",
      },
    },

    password: {
      type: String,
      select: false, // never return password by default
    },

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
      index: true,
    },
  },
  { timestamps: true }
);

/* ===========================
   PASSWORD HASHING
=========================== */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ===========================
   PASSWORD COMPARE
=========================== */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/* ===========================
   RESET TOKEN GENERATOR
=========================== */
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
