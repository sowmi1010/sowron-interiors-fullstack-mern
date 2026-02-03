import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef(null);
  const navigate = useNavigate();

  /* ⏳ COOLDOWN TIMER */
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  /* SEND OTP */
  const sendOtp = async () => {
    if (!email) {
      return setError("Enter your email address");
    }
    try {
      setError("");
      await api.post("/otp/send-login", { email });
      setStep(2);
      setCooldown(30);
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (err) {
      if (err.response?.status === 404) {
        return navigate(`/register?email=${encodeURIComponent(email)}`);
      }
      setError(err.response?.data?.message || "Failed to send OTP");
    }
  };

  /* VERIFY OTP */
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      return setError("Enter 6-digit OTP");
    }
    try {
      const res = await api.post("/otp/verify-login", { otp, email });

      localStorage.setItem("userToken", res.data.token);
      if (res.data.user?.phone) localStorage.setItem("userPhone", res.data.user.phone);
      if (res.data.user?.email) localStorage.setItem("userEmail", res.data.user.email);
      if (res.data.user?.name) localStorage.setItem("userName", res.data.user.name);

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-6
        bg-gray-50 dark:bg-[#0a0a0a]
        text-gray-900 dark:text-gray-100
        relative overflow-hidden
      "
    >
      {/* BACKGROUND GLOWS */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2
                      w-[520px] h-[520px]
                      bg-red-600/20 blur-[200px]" />
      <div className="absolute bottom-0 right-0
                      w-[420px] h-[420px]
                      bg-yellow-400/20 blur-[180px]" />

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative z-10 w-full max-w-sm
          rounded-3xl p-8 sm:p-10
          bg-white/80 dark:bg-white/5
          backdrop-blur-xl
          border border-gray-200 dark:border-white/10
          shadow-xl
        "
      >
        {/* TITLE */}
        <h2
          className="
            text-4xl font-extrabold text-center mb-2
            bg-gradient-to-r from-red-600 to-red-800
            bg-clip-text text-transparent
          "
        >
          Welcome Back
        </h2>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          Secure login using your email OTP
        </p>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-4 text-gray-400"
                />
                <input
                  type="email"
                  className="
                    w-full pl-12 py-4 rounded-xl
                    bg-white dark:bg-black/40
                    border border-gray-300 dark:border-white/10
                    focus:border-red-600 focus:ring-2
                    focus:ring-red-600/30
                    outline-none transition
                  "
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <button
                disabled={cooldown > 0}
                onClick={sendOtp}
                className="
                  w-full py-4 rounded-xl font-semibold
                  bg-gradient-to-r from-red-600 to-red-800
                  text-black
                  hover:brightness-110
                  disabled:opacity-50 transition
                "
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Send OTP →"}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                New user?{" "}
                <a
                  href="/register"
                  className="text-red-600 font-semibold hover:underline"
                >
                  Create account
                </a>
              </p>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-4 top-4 text-gray-400"
                />
                <input
                  ref={otpRef}
                  className="
                    w-full pl-12 py-4 rounded-xl
                    bg-white dark:bg-black/40
                    border border-gray-300 dark:border-white/10
                    text-center tracking-[0.4em]
                    focus:border-red-600 focus:ring-2
                    focus:ring-red-600/30
                    outline-none transition
                  "
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              <button
                onClick={verifyOtp}
                className="
                  w-full py-4 rounded-xl font-semibold
                  bg-gradient-to-r from-red-600 to-red-800
                  text-black
                  hover:brightness-110 transition
                "
              >
                Verify & Continue 
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                }}
                className="w-full text-sm text-gray-500 dark:text-gray-400"
              >
                ← Change email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
