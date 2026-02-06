import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

/* ===== HELPERS ===== */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =========================================================
   SEND OTP (REGISTER / PHONE + EMAIL)
========================================================= */
export const sendOtp = async (req, res, next) => {
  try {
    const { phone, email, name } = req.body;

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ phone });
    const emailUser = await User.findOne({ email: normalizedEmail });

    if (emailUser && (!user || String(emailUser._id) !== String(user._id))) {
      return res.status(409).json({ message: "Email already in use" });
    }

    if (user?.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({
        message: "Too many attempts. Try again later.",
      });
    }

    const otp = generateOtp();

    if (!user) {
      user = new User({ phone, isActive: true });
    }

    user.email = normalizedEmail;
    if (name) user.name = name.trim();

    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    user.otpVerified = false;

    await user.save();

    /* ===== SEND EMAIL OTP (SAFE) ===== */
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Your OTP - Sowron Interiors",
        html: `
          <p>Your OTP is <strong>${otp}</strong></p>
          <p>This OTP is valid for 5 minutes.</p>
        `,
      });
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message);

      user.otpHash = undefined;
      user.otpExpires = undefined;
      await user.save();

      return res.status(503).json({
        message: "Email service unavailable. Try again later.",
      });
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    next(err);
  }
};

/* =========================================================
   VERIFY OTP (PHONE)
========================================================= */
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

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({ message: "OTP locked" });
    }

    const isValid = await bcrypt.compare(otp, user.otpHash);

    if (!isValid) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = Date.now() + 15 * 60 * 1000;
      }
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

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
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ OTP Verify Error:", err);
    next(err);
  }
};

/* =========================================================
   SEND LOGIN OTP (EMAIL)
========================================================= */
export const sendLoginOtpByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(429).json({
        message: "Too many attempts. Try again later.",
      });
    }

    const otp = generateOtp();

    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    user.otpVerified = false;

    await user.save();

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Login OTP - Sowron Interiors",
        html: `<p>Your OTP is <strong>${otp}</strong></p>`,
      });
    } catch (err) {
      console.error("❌ Email failed:", err.message);

      user.otpHash = undefined;
      user.otpExpires = undefined;
      await user.save();

      return res.status(503).json({
        message: "Email service unavailable. Try again later.",
      });
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ OTP Send (Login) Error:", err);
    next(err);
  }
};

/* =========================================================
   VERIFY LOGIN OTP (EMAIL)
========================================================= */
export const verifyLoginOtpByEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, user.otpHash);

    if (!isValid) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = Date.now() + 15 * 60 * 1000;
      }
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

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
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ OTP Verify (Login) Error:", err);
    next(err);
  }
};
