import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10)
      return res.status(400).json({ message: "Invalid phone number" });

    const otp = generateOtp();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    await User.findOneAndUpdate(
      { phone },
      {
        phone,
        otp: hashOtp(otp),
        otpExpires,
        otpVerified: false,
        role: "user",
      },
      { upsert: true }
    );

    // ❌ REMOVE IN PRODUCTION
    console.log("📲 OTP:", otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "OTP send failed" });
  }
};



const hashOtp = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user || !user.otp || Date.now() > user.otpExpires)
      return res.status(400).json({ message: "OTP expired" });

    if (hashOtp(otp) !== user.otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.otp = null;
    user.otpExpires = null;
    user.otpVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        phone: user.phone,
        name: user.name,
      },
    });
  } catch {
    res.status(500).json({ message: "OTP verification failed" });
  }
};
