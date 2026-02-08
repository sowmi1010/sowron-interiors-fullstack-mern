import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { logAdminAuthEvent } from "../middleware/adminSecurity.js";
import Admin from "../models/Admin.js";

/* ===========================
   ADMIN LOGIN
=========================== */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    admin.otpExpires = Date.now() + 5 * 60 * 1000;
    admin.otpAttempts = 0;
    admin.otpLockedUntil = null;
    await admin.save({ validateBeforeSave: false });

    // ✅ SEND OTP VIA GMAIL
    await sendEmail({
      to: admin.email,
      subject: "Admin Login OTP - Sowron Interiors",
      html: `
        <p>Your OTP is <b>${otp}</b></p>
        <p>Valid for 5 minutes.</p>
      `,
    });

    res.json({
      success: true,
      otpRequired: true,
      message: "OTP sent to your email",
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    const msg = String(err?.message || "");
    const isEmailIssue =
      msg.includes("Email not configured") || msg.startsWith("Email send failed");

    res.status(500).json({
      message: isEmailIssue
        ? "Email service is not configured/available. Set RESEND_API_KEY (and RESEND_FROM) or EMAIL_USER/EMAIL_PASS on the server."
        : "Failed to send OTP",
    });
  }
};

/* ===========================
   ADMIN VERIFY OTP
=========================== */
export const adminVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email & OTP required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured" });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!admin || !admin.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    if (admin.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (admin.otpLockedUntil && admin.otpLockedUntil > Date.now()) {
      return res.status(429).json({ message: "OTP locked" });
    }

    const hashed = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashed !== admin.otpHash) {
      admin.otpAttempts += 1;
      if (admin.otpAttempts >= 5) {
        admin.otpLockedUntil = Date.now() + 15 * 60 * 1000;
      }
      await admin.save({ validateBeforeSave: false });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    admin.otpHash = undefined;
    admin.otpExpires = undefined;
    admin.otpAttempts = 0;
    admin.otpLockedUntil = null;
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { id: admin._id, type: "admin", email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ADMIN_JWT_EXPIRES || "15m" }
    );

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    if (process.env.DEBUG_AUTH === "true") {
      console.log("ADMIN AUTH DEBUG: set-cookie issued", {
        email: admin.email,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
    }

    await logAdminAuthEvent({
      adminId: admin._id,
      action: "ADMIN_LOGIN_SUCCESS",
      req,
      success: true,
    });

    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("ADMIN VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ===========================
   ADMIN LOGOUT
=========================== */
export const adminLogout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ success: true });
};

/* ===========================
   FORGOT PASSWORD
=========================== */
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    // Always respond success (anti-enumeration)
    if (!admin) {
      await logAdminAuthEvent({
        action: "ADMIN_FORGOT_REQUEST",
        req,
        success: true,
        meta: { email: email.toLowerCase(), userFound: false },
      });
      return res.json({
        success: true,
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const resetToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.ADMIN_URL}/reset/${resetToken}`;

    await sendEmail({
      to: admin.email,
      subject: "Admin Password Reset - Sowron Interiors",
      html: `
        <h3>Password Reset Request</h3>
        <p>This link is valid for 15 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    });

    await logAdminAuthEvent({
      adminId: admin._id,
      action: "ADMIN_FORGOT_REQUEST",
      req,
      success: true,
      meta: { email: admin.email, userFound: true },
    });

    res.json({
      success: true,
      message: "If this email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Password reset email failed" });
  }
};

/* ===========================
   RESET PASSWORD
=========================== */
export const adminResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || password.length < 8) {
      return res.status(400).json({
        message: "Token and strong password required",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!admin) {
      await logAdminAuthEvent({
        action: "ADMIN_RESET_FAILED",
        req,
        success: false,
        meta: { reason: "invalid_or_expired" },
      });
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    const isSame = await admin.comparePassword(password);
    if (isSame) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    await logAdminAuthEvent({
      adminId: admin._id,
      action: "ADMIN_RESET_SUCCESS",
      req,
      success: true,
    });

    res.json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};
