import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Smartphone,
  User,
  MapPin,
  Shield
} from "lucide-react";
import { api } from "../lib/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef(null);

  /* ⏳ COOLDOWN */
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  /* SEND OTP */
  const sendOtp = async () => {
    if (!form.name || !form.city || form.phone.length !== 10) {
      return setError("Please fill all details correctly");
    }
    try {
      setLoading(true);
      setError("");
      await api.post("/otp/send", { phone: form.phone });
      setStep(2);
      setCooldown(30);
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (err) {
      setError(err.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  /* VERIFY & REGISTER */
  const verify = async () => {
    if (otp.length !== 6) {
      return setError("Enter 6-digit OTP");
    }
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/otp/verify", {
        phone: form.phone,
        otp,
      });

      await api.put(
        "/user/update",
        { name: form.name, city: form.city },
        {
          headers: {
            Authorization: `Bearer ${res.data.token}`,
          },
        }
      );

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userPhone", form.phone);
      localStorage.setItem("userName", form.name);

      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-6 py-16
        bg-gray-50 dark:bg-[#0a0a0a]
        text-gray-900 dark:text-gray-100
        relative overflow-hidden
      "
    >
      {/* SOFT BACKGROUND GLOWS */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2
                      w-[520px] h-[520px]
                      bg-red-600/20 blur-[200px]" />
      <div className="absolute bottom-0 right-0
                      w-[420px] h-[420px]
                      bg-yellow-400/20 blur-[180px]" />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative z-10 w-full max-w-md
          rounded-3xl p-8 sm:p-10
          bg-white/80 dark:bg-white/5
          backdrop-blur-xl
          border border-gray-200 dark:border-white/10
          shadow-xl
        "
      >
        <h2
          className="
            text-4xl font-extrabold text-center mb-3
            bg-gradient-to-r from-red-600 to-red-800
            bg-clip-text text-transparent
          "
        >
          Create Account
        </h2>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          Register securely using your mobile number
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
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Field
                icon={<User size={18} />}
                placeholder="Full Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                icon={<MapPin size={18} />}
                placeholder="City"
                value={form.city}
                onChange={(v) => setForm({ ...form, city: v })}
              />
              <Field
                icon={<Smartphone size={18} />}
                placeholder="Phone Number"
                maxLength={10}
                value={form.phone}
                onChange={(v) =>
                  setForm({ ...form, phone: v.replace(/\D/g, "") })
                }
              />

              <PrimaryBtn onClick={sendOtp} loading={loading || cooldown > 0}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP →"}
              </PrimaryBtn>
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
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                <Shield size={14} className="inline" /> OTP sent to {form.phone}
              </p>

              <input
                ref={otpRef}
                className="
                  w-full text-center text-2xl tracking-widest
                  rounded-xl p-4
                  bg-white dark:bg-black/40
                  border border-gray-300 dark:border-white/10
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

              <PrimaryBtn onClick={verify} loading={loading}>
                 Verify & Register
              </PrimaryBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ================= FIELD ================= */
function Field({ icon, value, onChange, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-4 text-gray-400">
        {icon}
      </span>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-12 py-4 rounded-xl
          bg-white dark:bg-black/40
          border border-gray-300 dark:border-white/10
          focus:border-red-600 focus:ring-2
          focus:ring-red-600/30
          outline-none transition
        "
      />
    </div>
  );
}

/* ================= BUTTON ================= */
function PrimaryBtn({ children, onClick, loading }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={loading}
      className="
        w-full py-4 rounded-xl font-semibold
        bg-gradient-to-r from-red-600 to-red-800
        text-black
        hover:brightness-110
        disabled:opacity-50 transition
      "
    >
      {loading ? "Please wait..." : children}
    </motion.button>
  );
}
