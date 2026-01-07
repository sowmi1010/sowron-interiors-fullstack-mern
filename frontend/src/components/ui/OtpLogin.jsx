import { useState, useEffect } from "react";
import { Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";

export default function OtpLogin({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  /* ⏳ COOLDOWN TIMER */
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (phone.length !== 10) {
      return setError("Enter valid 10-digit phone number");
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/otp/send", { phone });
      setStep(2);
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "OTP send failed");
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

      // ✅ SAVE SESSION
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userPhone", phone);

      if (res.data.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
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
      <h2 className="text-3xl font-extrabold text-center
        bg-gradient-to-r from-orange-500 to-yellow-400
        bg-clip-text text-transparent">
        Verify Phone Number
      </h2>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1 */}
        {step === 1 && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Input
              icon={<Phone size={18} />}
              placeholder="Enter Phone Number"
              value={phone}
              onChange={setPhone}
              maxLength={10}
            />

            <PrimaryBtn
              text={
                cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : loading
                  ? "Sending..."
                  : "Send OTP"
              }
              icon={<ArrowRight size={18} />}
              onClick={sendOtp}
              loading={loading || cooldown > 0}
            />
          </motion.div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Input
              icon={<ShieldCheck size={18} />}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={setOtp}
              maxLength={6}
            />

            <PrimaryBtn
              text={loading ? "Verifying..." : "Verify OTP"}
              icon={<ShieldCheck size={18} />}
              onClick={verifyOtp}
              loading={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ================= INPUT ================= */
function Input({ icon, value, onChange, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-3.5 text-gray-400">
        {icon}
      </span>
      <input
        {...props}
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, ""))
        }
        className="
          w-full pl-10 pr-3 py-3 rounded-xl
          bg-white dark:bg-[#111]
          text-gray-900 dark:text-gray-100
          border border-gray-300 dark:border-gray-700
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-orange-500
          transition
        "
      />
    </div>
  );
}

/* ================= BUTTON ================= */
function PrimaryBtn({ text, icon, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
        w-full py-3 rounded-xl font-bold
        flex items-center justify-center gap-2
        bg-gradient-to-r from-orange-500 to-yellow-400
        text-black
        hover:brightness-110 hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        transition
      "
    >
      {text} {icon}
    </button>
  );
}
