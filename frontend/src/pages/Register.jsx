import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Smartphone, User, MapPin, Shield } from "lucide-react";
import { api } from "./../lib/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef(null);

  /* ⏳ COOLDOWN TIMER */
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (form.phone.length !== 10) {
      return setError("Enter valid 10-digit phone number");
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

  /* ================= VERIFY OTP ================= */
  const verify = async () => {
    if (otp.length !== 6) {
      return setError("Enter 6-digit OTP");
    }

    try {
      setLoading(true);
      setError("");

      // 1️⃣ verify OTP
      const res = await api.post("/otp/verify", {
        phone: form.phone,
        otp,
      });

      // 2️⃣ update profile
      await api.put(
        "/user/update",
        { name: form.name, city: form.city },
        {
          headers: {
            Authorization: `Bearer ${res.data.token}`,
          },
        }
      );

      // 3️⃣ save session
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userPhone", form.phone);
      localStorage.setItem("userName", form.name);

      // 4️⃣ redirect
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#050505]
                    px-6 py-16 text-gray-900 dark:text-gray-200 relative overflow-hidden">
      {/* FLOATING BG */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-orange-400/10 blur-[50px]"
            animate={{ y: [-120, 100, -120], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10 + i, repeat: Infinity }}
            style={{
              width: 130 + i * 6,
              height: 130 + i * 6,
              left: `${(i * 15) % 100}%`,
              top: `${(i * 10) % 90}%`,
            }}
          />
        ))}
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/40 dark:bg-black/40
                   border border-white/30 dark:border-white/10
                   shadow-[0_0_40px_rgba(255,174,0,0.15)]
                   rounded-2xl p-8 relative z-10"
      >
        <h2 className="text-4xl font-extrabold text-center mb-6
                       bg-gradient-to-r from-orange-500 to-yellow-300
                       text-transparent bg-clip-text">
          Create Your Account
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Input icon={<User size={18} />} placeholder="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            <Input icon={<MapPin size={18} />} placeholder="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
            />

            <Input icon={<Smartphone size={18} />} placeholder="Phone Number"
              maxLength={10}
              value={form.phone}
              onChange={(v) =>
                setForm({ ...form, phone: v.replace(/\D/g, "") })
              }
            />

            <Button
              onClick={sendOtp}
              loading={loading || cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP →"}
            </Button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <p className="text-center text-xs mb-4 text-gray-500">
              <Shield size={14} className="inline" /> OTP sent to {form.phone}
            </p>

            <input
              ref={otpRef}
              className="w-full text-center text-2xl tracking-widest
                         bg-white/30 dark:bg-black/30
                         rounded-xl p-3 border border-gray-300
                         dark:border-white/10 outline-none mb-6"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            <Button onClick={verify} loading={loading} green>
              <Check size={18} /> Verify & Register
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ================= INPUT ================= */
function Input({ icon, value, onChange, ...rest }) {
  return (
    <div className="relative mb-4">
      <span className="absolute left-3 top-3 text-gray-500">{icon}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 p-3 rounded-xl
                   bg-white/30 dark:bg-black/30
                   border border-gray-300 dark:border-white/10
                   outline-none focus:border-orange-500 transition"
      />
    </div>
  );
}

/* ================= BUTTON ================= */
function Button({ children, onClick, loading, green }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-semibold shadow-lg
        ${green
          ? "bg-green-500 hover:bg-green-600 text-white"
          : "bg-gradient-to-r from-orange-500 to-yellow-400 text-black"}
        disabled:opacity-50`}
    >
      {loading ? "Please wait..." : children}
    </motion.button>
  );
}
