import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      required: true,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: "Invalid phone number",
      },
    },

    password: {
      type: String,
      select: false,
      minlength: 6,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    otpHash: String,
    otpExpires: Date,
    otpAttempts: { type: Number, default: 0 },
    otpLockedUntil: Date,
    otpVerified: { type: Boolean, default: false },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },




    lastLogin: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ===========================
   INDEXES
=========================== */
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

/* ===========================
   PASSWORD HASH
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
   RESET TOKEN
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
