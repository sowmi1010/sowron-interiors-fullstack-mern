import { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Smartphone, User, MapPin, Shield } from "lucide-react";

const API = "http://localhost:5000/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const otpRef = useRef(null);

  /* SEND OTP */
  const sendOtp = async () => {
    if (!form.phone || form.phone.length !== 10)
      return alert("⚠️ Enter valid 10-digit phone number");

    try {
      setLoading(true);
      await axios.post(`${API}/otp/send`, { phone: form.phone });
      setStep(2);
      setTimeout(() => otpRef.current?.focus(), 250);
    } catch {
      alert("❌ Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* VERIFY OTP + AUTO LOGIN */
  const verify = async () => {
    if (otp.length < 4) return alert("⚠️ Invalid OTP");

    try {
      setLoading(true);

      // 1️⃣ verify otp
      const res = await axios.post(`${API}/otp/verify`, {
        phone: form.phone,
        otp,
      });

      // 2️⃣ update profile
      await axios.put(`${API}/user/update`, form, {
        headers: {
          Authorization: `Bearer ${res.data.token}`,
        },
      });

      // 3️⃣ save session (IMPORTANT)
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userPhone", form.phone);
      localStorage.setItem("userName", form.name);

      // 4️⃣ redirect home
      window.location.href = "/";
    } catch {
      alert("❌ Incorrect OTP. Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#050505] px-6 py-16 text-gray-900 dark:text-gray-200 relative overflow-hidden">
      {/* Floating background */}
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

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/40 dark:bg-black/40
                   border border-white/30 dark:border-white/10
                   shadow-[0_0_40px_rgba(255,174,0,0.15)]
                   rounded-2xl p-8 relative z-10"
      >
        <h2
          className="text-4xl font-extrabold text-center mb-8
                       bg-gradient-to-r from-orange-500 to-yellow-300
                       text-transparent bg-clip-text"
        >
          Create Your Account
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Input
              icon={<User size={18} />}
              placeholder="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            <Input
              icon={<MapPin size={18} />}
              placeholder="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
            />

            <Input
              icon={<Smartphone size={18} />}
              placeholder="Phone Number"
              maxLength={10}
              value={form.phone}
              onChange={(v) =>
                setForm({ ...form, phone: v.replace(/\D/g, "") })
              }
            />

            <Button onClick={sendOtp} loading={loading}>
              Send OTP →
            </Button>
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-orange-400 font-semibold hover:underline"
              >
                Login
              </a>
            </p>
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

/* REUSABLE INPUT */
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

/* REUSABLE BUTTON */
function Button({ children, onClick, loading, green }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-semibold shadow-lg
        ${
          green
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-gradient-to-r from-orange-500 to-yellow-400 text-black"
        }
      `}
    >
      {loading ? "Please wait..." : children}
    </motion.button>
  );
}
