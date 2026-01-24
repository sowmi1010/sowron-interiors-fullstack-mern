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

    // 🔒 Lock check (per phone)
    if (user?.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({
        message: "Too many attempts. Try again later.",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    if (!user) {
      user = new User({ phone });
    }

    user.otpHash = otpHash;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    user.otpVerified = false;

    await user.save();

    /* ===========================
       SEND OTP (PROVIDER)
       👉 Twilio / MSG91 / Interakt
    =========================== */

    // ⚠️ DEV ONLY
    if (process.env.NODE_ENV === "development") {
      console.log("📲 DEV OTP:", otp);
    }

    res.json({
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

    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // ⏰ Expired
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 🔒 Locked
    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({
        message: "OTP locked. Try again later.",
      });
    }

    // ❌ Wrong OTP
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
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
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
