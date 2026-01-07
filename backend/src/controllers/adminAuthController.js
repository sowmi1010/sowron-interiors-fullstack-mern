import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

export const adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const resetToken = admin.createPasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.ADMIN_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: admin.email,
    subject: "Admin Password Reset",
    html: `
      <p>You requested a password reset.</p>
      <p>This link is valid for <b>15 minutes</b>.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });

  res.json({ success: true, message: "Reset link sent to email" });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin)
      return res.status(401).json({ message: "Invalid admin credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid admin credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminResetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password too short" });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const admin = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
    role: "admin",
  });

  if (!admin) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  admin.password = password;

  // 🔥 Invalidate token
  admin.resetPasswordToken = null;
  admin.resetPasswordExpires = null;

  await admin.save();

  res.json({ success: true, message: "Password reset successful" });
};
