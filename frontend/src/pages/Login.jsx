// src/pages/Login.jsx
import { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Smartphone, KeyRound } from "lucide-react";

const API = "http://localhost:5000/api";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const otpRef = useRef(null);

  const sendOtp = async () => {
    if (phone.length !== 10) return setError("Enter valid 10-digit number");

    try {
      await axios.post(`${API}/otp/send`, { phone });
      setError("");
      setStep(2);
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch {
      setError("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 4) return setError("Invalid OTP");

    try {
      const res = await axios.post(`${API}/otp/verify`, { phone, otp });

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userPhone", phone);

      // ✅ SAVE NAME (IMPORTANT)
      if (res.data.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      window.location.href = "/";
    } catch {
      setError("Incorrect OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 rounded-2xl bg-black/40 backdrop-blur border border-white/10"
      >
        <h2
          className="text-4xl font-extrabold text-center mb-4
          bg-gradient-to-r from-orange-500 to-yellow-300 bg-clip-text text-transparent"
        >
          Login With OTP
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        {step === 1 && (
          <>
            <div className="relative mb-4">
              <Smartphone
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 p-3 rounded-xl bg-black/30 border border-gray-600"
                placeholder="Phone Number"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <button
              onClick={sendOtp}
              className="w-full py-3 rounded-xl bg-orange-500 text-black font-semibold"
            >
              Send OTP →
            </button>
            <p className="mt-6 text-center text-sm text-white">
              New user?{" "}
              <a
                href="/register"
                className="text-orange-400 font-semibold hover:underline"
              >
                Create an account
              </a>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="relative mb-4">
              <KeyRound
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                ref={otpRef}
                className="w-full pl-10 p-3 rounded-xl bg-black/30 border border-gray-600 text-center tracking-widest"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <button
              onClick={verifyOtp}
              className="w-full py-3 rounded-xl bg-green-500 font-semibold"
            >
              Verify OTP ✔
            </button>

            <button
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              className="mt-3 w-full text-sm text-gray-400"
            >
              ← Change Number
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
