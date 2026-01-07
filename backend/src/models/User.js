import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";


const userSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: String,
    otp: String,
    otpExpires: Date,
    otpVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

/* ✅ FIXED PRE-SAVE HOOK (NO next()) */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* ADMIN PASSWORD CHECK */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export default mongoose.model("User", userSchema);
  