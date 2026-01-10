import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ===========================
   HELPERS
=========================== */
const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ===========================
   SEND OTP
=========================== */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const user = await User.findOne({ phone });

    // 🔒 Lock check
    if (user?.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({
        message: "Too many attempts. Please try again later.",
      });
    }

    const otp = generateOtp();

    await User.findOneAndUpdate(
      { phone },
      {
        phone,
        otpHash: hashOtp(otp),
        otpExpires: Date.now() + 5 * 60 * 1000, // 5 mins
        otpAttempts: 0,
        otpLockedUntil: null,
        otpVerified: false,
      },
      { upsert: true, new: true }
    );

    // ❌ REMOVE OTP LOG IN PRODUCTION
    if (process.env.NODE_ENV !== "production") {
      console.log("📲 OTP (DEV ONLY):", otp);
    }

    // TODO: integrate SMS provider here

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP SEND ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ===========================
   VERIFY OTP
=========================== */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ❌ Expired
    if (!user.otpExpires || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ❌ Locked
    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({ message: "OTP locked. Try later." });
    }

    // ❌ Wrong OTP
    if (hashOtp(otp) !== user.otpHash) {
      user.otpAttempts += 1;

      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins
      }

      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ Success
    user.otpHash = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    user.otpVerified = true;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name || "",
      },
    });
  } catch (err) {
    console.error("OTP VERIFY ERROR:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
