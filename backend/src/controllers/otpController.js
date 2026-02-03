import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendOtpSms } from "../utils/sendSms.js";
import sendEmail from "../utils/sendEmail.js";

/* ===== HELPERS ===== */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ===== SEND OTP ===== */
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
    const existingByEmail = await User.findOne({ email: normalizedEmail });

    if (existingByEmail && (!user || String(existingByEmail._id) !== String(user._id))) {
      return res.status(409).json({ message: "Email already in use" });
    }

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

    if (user.email && user.email !== normalizedEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    user.email = normalizedEmail;
    if (name) user.name = name.trim();

    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    user.otpVerified = false;

    try {
      await user.save();
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ message: "Email already in use" });
      }
      throw err;
    }

    const channel = (process.env.OTP_CHANNEL || "email").toLowerCase();
    if (channel === "email") {
      await sendEmail({
        to: email,
        subject: "Your OTP - Sowron Interiors",
        html: `
          <p>Your OTP is <strong>${otp}</strong></p>
          <p>This OTP is valid for 5 minutes. Do not share it.</p>
        `,
      });
    } else {
      await sendOtpSms({ phone, otp });
    }

    if (process.env.OTP_DEBUG === "true") {
      console.log("OTP DEBUG =>", {
        phone,
        otp,
        expiresAt: new Date(user.otpExpires).toLocaleTimeString(),
      });
    }

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
    const { phone, otp, email } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone & OTP required" });
    }

    const user = await User.findOne({ phone });

    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (email && user.email && email.toLowerCase() !== user.email) {
      return res.status(400).json({ message: "Email mismatch" });
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

    const isValid = await bcrypt.compare(otp, user.otpHash);
    if (!isValid) {
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

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
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

/* ===== SEND OTP (LOGIN BY EMAIL) ===== */
export const sendLoginOtpByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    if (user?.otpLockedUntil && user.otpLockedUntil > Date.now()) {
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

    await sendEmail({
      to: normalizedEmail,
      subject: "Your Login OTP - Sowron Interiors",
      html: `
        <p>Your OTP is <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes. Do not share it.</p>
      `,
    });

    if (process.env.OTP_DEBUG === "true") {
      console.log("OTP DEBUG (EMAIL LOGIN) =>", {
        email: normalizedEmail,
        otp,
        expiresAt: new Date(user.otpExpires).toLocaleTimeString(),
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("❌ OTP Send (Email Login) Error:", err);
    next(err);
  }
};

/* ===== VERIFY OTP (LOGIN BY EMAIL) ===== */
export const verifyLoginOtpByEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

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

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured" });
    }

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
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ OTP Verify (Email Login) Error:", err);
    next(err);
  }
};
