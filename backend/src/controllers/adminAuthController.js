import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const admin = await User.findOne({ email, role: "admin" }).select("+password");
    if (!admin)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    res.status(500).json({ message: "Server error" });
  }
};

export const adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  const resetToken = admin.createPasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.ADMIN_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: admin.email,
    subject: "Admin Password Reset",
    html: `
      <p>You requested a password reset</p>
      <p>Valid for 15 minutes</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });

  res.json({ success: true, message: "Reset link sent" });
};

export const adminResetPassword = async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
    role: "admin",
  });

  if (!admin) return res.status(400).json({ message: "Invalid token" });

  admin.password = password;
  admin.resetPasswordToken = null;
  admin.resetPasswordExpires = null;

  await admin.save();

  res.json({ success: true, message: "Password reset successful" });
};
