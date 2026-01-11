import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, KeyRound } from "lucide-react";
import { api } from "../lib/api";
import SEO from "../components/SEO";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef(null);

  /* ================= SEO ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ⏳ COOLDOWN TIMER */
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (phone.length !== 10) {
      return setError("Enter valid 10-digit mobile number");
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/otp/send", { phone });

      setStep(2);
      setCooldown(30);
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (err) {
      if (!err.response) {
        setError("Server not responding. Please try again.");
      } else {
        setError(err.response.data.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      return setError("Enter 6-digit OTP");
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/otp/verify", { phone, otp });

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userPhone", phone);
      localStorage.setItem("isLoggedIn", "true");

      if (res.data.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      window.location.href = "/";
    } catch (err) {
      if (!err.response) {
        setError("Server not responding. Please try again.");
      } else {
        setError(err.response.data.message || "Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Login | Sowron Interiors – Secure OTP Login"
        description="Login to your Sowron Interiors account securely using mobile OTP. Book consultations, get estimates and manage your projects."
        keywords="Sowron Interiors login, OTP login, interior consultation login"
      />

      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 relative overflow-hidden">

        {/* BACKGROUND GLOWS */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-red-600/20 blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-yellow-400/20 blur-[180px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-sm rounded-3xl p-8 sm:p-10 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-xl"
        >
          <h1 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-red-600 to-yellow-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            Secure login using your mobile number
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
                  <Smartphone
                    size={18}
                    className="absolute left-4 top-4 text-gray-400"
                  />
                  <input
                    className="w-full pl-12 py-4 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 focus:border-red-600 focus:ring-2 focus:ring-red-600/30 outline-none transition"
                    placeholder="Enter mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>

                <button
                  disabled={loading || cooldown > 0}
                  onClick={sendOtp}
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-yellow-400 text-black hover:brightness-110 disabled:opacity-50 transition"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP →"}
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
                    className="w-full pl-12 py-4 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-center tracking-[0.4em] focus:border-red-600 focus:ring-2 focus:ring-red-600/30 outline-none transition"
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
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-yellow-400 text-black hover:brightness-110 disabled:opacity-50 transition"
                >
                  {loading ? "Verifying..." : "Verify & Continue ✔"}
                </button>

                <button
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                  }}
                  className="w-full text-sm text-gray-500 dark:text-gray-400"
                >
                  ← Change number
                </button>

                <button
                  onClick={sendOtp}
                  disabled={cooldown > 0}
                  className="text-sm text-red-600 hover:underline block mx-auto"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
