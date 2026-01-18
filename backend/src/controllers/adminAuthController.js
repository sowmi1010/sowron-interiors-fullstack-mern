import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

/* ===========================
   ADMIN LOGIN
=========================== */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const admin = await User.findOne({ email, role: "admin" }).select("+password");

    // Prevent user enumeration
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Audit log
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ===========================
   FORGOT PASSWORD
=========================== */
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Always return success to prevent enumeration
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
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
        <p>If you did not request this, please ignore this email.</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
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

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      role: "admin",
    }).select("+password");

    if (!admin) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    // Prevent reuse of same password
    const isSame = await admin.comparePassword(password);
    if (isSame) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    admin.password = password;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;

    await admin.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};
