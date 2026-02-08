import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import sendSms from "../utils/sendSms.js";

/* ===== HELPERS ===== */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const requireJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return process.env.JWT_SECRET;
};

const resetOtpState = async (user) => {
  user.otpHash = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.otpLockedUntil = null;
  await user.save();
};

/* =========================================================
   SEND OTP (REGISTER / PHONE + EMAIL)
========================================================= */
export const sendOtp = async (req, res, next) => {
  try {
    const { phone, email, name } = req.body;

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (!email || typeof email !== "string") {
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

    const deliveredVia = [];

    try {
      await sendSms({
        to: phone,
        message: `${otp} is your Sowron Interiors OTP. Valid for 5 minutes.`,
      });
      deliveredVia.push("mobile");
    } catch (smsErr) {
      console.error("SMS failed:", smsErr.message);
    }

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Your OTP - Sowron Interiors",
        html: `
          <p>Your OTP is <strong>${otp}</strong></p>
          <p>This OTP is valid for 5 minutes.</p>
        `,
      });
      deliveredVia.push("email");
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }

    if (!deliveredVia.length) {
      await resetOtpState(user);
      return res.status(503).json({
        message: "OTP delivery failed. Try again later.",
      });
    }

    res.json({
      success: true,
      message: `OTP sent to ${deliveredVia.join(" and ")}`,
    });
  } catch (err) {
    console.error("OTP Send Error:", err);
    next(err);
  }
};

/* =========================================================
   VERIFY OTP (PHONE)
========================================================= */
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, email } = req.body;

    if (
      typeof phone !== "string" ||
      typeof otp !== "string" ||
      !phone.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({ message: "Phone & OTP required" });
    }

    const user = await User.findOne({ phone });

    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.toLowerCase().trim();
      if (user.email !== normalizedEmail) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
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
      requireJwtSecret(),
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
    console.error("OTP Verify Error:", err);
    next(err);
  }
};

/* =========================================================
   SEND LOGIN OTP (EMAIL)
========================================================= */
export const sendLoginOtpByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
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

    const deliveredVia = [];

    if (user.phone) {
      try {
        await sendSms({
          to: user.phone,
          message: `${otp} is your Sowron Interiors login OTP. Valid for 5 minutes.`,
        });
        deliveredVia.push("mobile");
      } catch (smsErr) {
        console.error("SMS failed:", smsErr.message);
      }
    }

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Login OTP - Sowron Interiors",
        html: `<p>Your OTP is <strong>${otp}</strong></p>`,
      });
      deliveredVia.push("email");
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }

    if (!deliveredVia.length) {
      await resetOtpState(user);
      return res.status(503).json({
        message: "OTP delivery failed. Try again later.",
      });
    }

    res.json({
      success: true,
      message: `OTP sent to ${deliveredVia.join(" and ")}`,
    });
  } catch (err) {
    console.error("OTP Send (Login) Error:", err);
    next(err);
  }
};

/* =========================================================
   VERIFY LOGIN OTP (EMAIL)
========================================================= */
export const verifyLoginOtpByEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

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
      requireJwtSecret(),
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
    console.error("OTP Verify (Login) Error:", err);
    next(err);
  }
};
