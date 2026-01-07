// controllers/otpController.js
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* 📲 SEND OTP */
export const sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10)
    return res.status(400).json({ message: "Invalid phone number" });

  const user = await User.findOne({ phone });

  // 🔒 LOCK CHECK
  if (user?.otpLockedUntil && user.otpLockedUntil > Date.now()) {
    return res.status(429).json({
      message: "Too many attempts. Try later.",
    });
  }

  const otp = generateOtp();

  await User.findOneAndUpdate(
    { phone },
    {
      phone,
      otpHash: hashOtp(otp),
      otpExpires: Date.now() + 5 * 60 * 1000,
      otpAttempts: 0,
      otpLockedUntil: null,
      otpVerified: false,
    },
    { upsert: true }
  );

  console.log("📲 OTP (DEV ONLY):", otp); // remove in prod

  res.json({ success: true, message: "OTP sent" });
};

/* ✅ VERIFY OTP */
export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone });
  if (!user) return res.status(400).json({ message: "Invalid OTP" });

  // ❌ EXPIRED
  if (!user.otpExpires || Date.now() > user.otpExpires)
    return res.status(400).json({ message: "OTP expired" });

  // ❌ LOCKED
  if (user.otpLockedUntil && user.otpLockedUntil > Date.now())
    return res.status(429).json({ message: "OTP locked. Try later." });

  // ❌ WRONG OTP
  if (hashOtp(otp) !== user.otpHash) {
    user.otpAttempts += 1;

    if (user.otpAttempts >= 5) {
      user.otpLockedUntil = Date.now() + 15 * 60 * 1000;
    }

    await user.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // ✅ SUCCESS
  user.otpHash = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  user.otpLockedUntil = null;
  user.otpVerified = true;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    token,
    user: { phone: user.phone, name: user.name },
  });
};
