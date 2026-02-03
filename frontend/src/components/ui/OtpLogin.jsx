import { useState, useEffect, useRef } from "react";
import { ShieldCheck, ArrowRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";

export default function OtpLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef(null);

  /* ================= COOLDOWN ================= */
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!email) {
      return setError("Enter your email address");
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/otp/send-login", { email });

      setStep(2);
      setCooldown(30);
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (err) {
      if (!err.response) {
        setError("Server not responding. Please try again.");
      } else if (err.response.status === 404) {
        setError("Account not found. Please register first.");
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
      return setError("Enter the 6-digit OTP");
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/otp/verify-login", { otp, email });

      localStorage.setItem("userToken", res.data.token);
      if (res.data.user?.phone) localStorage.setItem("userPhone", res.data.user.phone);
      if (res.data.user?.email) localStorage.setItem("userEmail", res.data.user.email);
      localStorage.setItem("isLoggedIn", "true");

      if (res.data.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      onSuccess?.();
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* TITLE */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold">
          Secure Email Verification
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We'll send a one-time password to your email
        </p>

        <span className="block mx-auto mt-4 w-14 h-[3px] bg-gradient-to-r from-red-600 to-yellow-400 rounded-full" />
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <AnimatePresence mode="wait">
        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Input
              icon={Mail}
              placeholder="Email Address"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />

            <PrimaryButton
              text={
                cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : loading
                  ? "Sending OTP…"
                  : "Send OTP"
              }
              icon={ArrowRight}
              onClick={sendOtp}
              disabled={loading || cooldown > 0}
            />
          </motion.div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Input
              icon={ShieldCheck}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={setOtp}
              maxLength={6}
              inputRef={otpRef}
              sanitize={(v) => v.replace(/\\D/g, "")}
            />

            <PrimaryButton
              text={loading ? "Verifying…" : "Verify & Continue"}
              icon={ShieldCheck}
              onClick={verifyOtp}
              disabled={loading}
            />

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
  );
}

/* ================= INPUT ================= */
function Input({
  icon: Icon,
  value,
  onChange,
  inputRef,
  sanitize,
  ...props
}) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-3.5 text-gray-400" />
      <input
        {...props}
        ref={inputRef}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          onChange(sanitize ? sanitize(next) : next);
        }}
        className="
          w-full pl-10 pr-3 py-3 rounded-xl
          bg-gray-50 dark:bg-[#1a1a1a]
          border border-gray-300 dark:border-white/10
          text-sm outline-none
          focus:border-red-500 transition
        "
      />
    </div>
  );
}

/* ================= BUTTON ================= */
function PrimaryButton({ text, icon: Icon, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        w-full py-3 rounded-xl font-semibold
        flex items-center justify-center gap-2
        bg-gradient-to-r from-red-600 to-red-700
        text-white
        hover:shadow-red-600/40
        transition
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {text}
      {Icon && <Icon size={18} />}
    </button>
  );
}
