// src/pages/Login.jsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Smartphone, KeyRound } from "lucide-react";
import { api } from "./../lib/api";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef(null);

  /* 🔁 COOLDOWN TIMER */
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (phone.length !== 10) {
      return setError("Enter valid 10-digit number");
    }

    try {
      setError("");
      await api.post("/otp/send", { phone });
      setStep(2);
      setCooldown(30); // ⏳ RESEND AFTER 30s
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      return setError("Enter 6-digit OTP");
    }

    try {
      const res = await api.post("/otp/verify", { phone, otp });

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userPhone", phone);

      if (res.data.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 rounded-2xl bg-black/40 backdrop-blur border border-white/10"
      >
        <h2 className="text-4xl font-extrabold text-center mb-4
                       bg-gradient-to-r from-orange-500 to-yellow-300
                       bg-clip-text text-transparent">
          Login With OTP
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        {/* STEP 1 */}
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
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            <button
              disabled={cooldown > 0}
              onClick={sendOtp}
              className="w-full py-3 rounded-xl bg-orange-500 text-black font-semibold
                         disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP →"}
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

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="relative mb-4">
              <KeyRound
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                ref={otpRef}
                className="w-full pl-10 p-3 rounded-xl bg-black/30
                           border border-gray-600 text-center tracking-widest"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
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
                setError("");
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
