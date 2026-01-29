import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ===== HELPERS ===== */
const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ===== SEND OTP ===== */
export const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    let user = await User.findOne({ phone });

    // 🔒 LOCK CHECK
    if (user?.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({
        message: "Too many attempts. Try again later.",
      });
    }

    const otp = generateOtp();

    if (!user) {
      user = new User({
        phone,
        isActive: true,
      });
    }

    user.otpHash = hashOtp(otp);
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    user.otpLockedUntil = null;
    user.otpVerified = false;

    await user.save();

    /* ✅ ALWAYS PRINT OTP (DEBUG MODE) */
    console.log(
      "📲 OTP DEBUG =>",
      {
        phone,
        otp,
        expiresAt: new Date(user.otpExpires).toLocaleTimeString(),
      }
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    next(err);
  }
};

/* ===== VERIFY OTP ===== */
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone & OTP required" });
    }

    const user = await User.findOne({ phone });

    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({ message: "OTP locked" });
    }

    if (hashOtp(otp) !== user.otpHash) {
      user.otpAttempts += 1;

      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ SUCCESS
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    user.otpVerified = true;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "TEMP_SECRET",
      { expiresIn: "7d" }
    );

    console.log("✅ OTP VERIFIED for:", phone);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err);
    next(err);
  }
};
