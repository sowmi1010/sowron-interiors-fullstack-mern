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
export const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
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
    const otpHash = hashOtp(otp);

    user = await User.findOneAndUpdate(
      { phone },
      {
        phone,
        otpHash,
        otpExpires: Date.now() + 5 * 60 * 1000,
        otpAttempts: 0,
        otpLockedUntil: null,
        otpVerified: false,
      },
      { upsert: true, new: true }
    );

    /* ===========================
       SEND OTP VIA PROVIDER HERE
       (Twilio / Interakt / MSG91)
    =========================== */

    // ❌ Never log OTP in production
    if (process.env.NODE_ENV === "development") {
      console.log("📲 DEV OTP:", otp);
    }

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP Send Error:", error);
    next(error);
  }
};

/* ===========================
   VERIFY OTP
=========================== */
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ❌ EXPIRED
    if (!user.otpExpires || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 🔒 LOCKED
    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({ message: "OTP locked. Try later." });
    }

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

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    next(error);
  }
};
