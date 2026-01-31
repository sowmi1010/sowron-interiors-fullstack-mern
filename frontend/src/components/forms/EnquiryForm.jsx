import { useState } from "react";
import { api } from "../../lib/api";
import {
  User,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function EnquiryForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      return toast.error("Name & Phone are required");
    }

    try {
      setLoading(true);

      await api.post("/enquiry/add", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        message: form.message.trim(),
      });

      setSuccess(true);
      setForm({ name: "", phone: "", city: "", message: "" });
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative max-w-lg mx-auto"
    >
      {/* GLOW BACKDROP */}
      <div className="absolute -inset-1 rounded-[3rem]
        bg-gradient-to-r from-red-600/20 to-yellow-400/20
        blur-2xl opacity-60" />

      {/* SUCCESS */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="
              mb-6 flex items-center gap-3
              rounded-2xl p-4 text-sm
              bg-green-100 text-green-700
              dark:bg-green-900/40 dark:text-green-200
              shadow-lg
            "
          >
            <CheckCircle size={20} />
            Thank you! Our consultant will contact you shortly.
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM */}
      <form
        onSubmit={submit}
        className="
          relative rounded-[3rem] p-10
          bg-white/80 dark:bg-[#121212]/80
          backdrop-blur-2xl
          border border-white/20 dark:border-white/10
          shadow-[0_40px_100px_rgba(0,0,0,0.25)]
        "
      >
        {/* HEADER */}
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-extrabold tracking-tight">
            Book a Free Consultation
          </h3>

          <p className="mt-3 text-sm opacity-70">
            Talk directly with our interior design expert
          </p>

          <span className="block mx-auto mt-6 w-20 h-[3px]
            bg-gradient-to-r from-red-600 to-yellow-400 rounded-full" />
        </div>

        {/* INPUTS */}
        <FloatingField
          icon={User}
          label="Full Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        <FloatingField
          icon={Phone}
          label="Phone Number"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />

        <FloatingField
          icon={MapPin}
          label="City"
          value={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
        />

        {/* MESSAGE */}
        <div className="mb-10 relative">
          <MessageCircle size={18}
            className="absolute left-5 top-5 text-gray-400" />

          <textarea
            rows={4}
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            className="
              peer w-full rounded-3xl pl-12 pr-5 py-4
              bg-white/60 dark:bg-[#1a1a1a]
              border border-gray-300 dark:border-white/10
              outline-none resize-none text-sm
              focus:border-red-500 focus:ring-2 focus:ring-red-500/20
              transition-all
            "
            placeholder="Tell us about your project (optional)"
          />
        </div>

        {/* SUBMIT */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-3
            py-5 rounded-full font-semibold tracking-wide
            bg-gradient-to-r from-red-600 to-red-700
            text-white text-sm
            shadow-xl shadow-red-600/40
            hover:shadow-red-600/60
            transition disabled:opacity-60
          "
        >
          {loading ? "Submitting…" : (
            <>
              <Send size={18} /> Request Call Back
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ================= FLOATING FIELD ================= */

function FloatingField({ icon: Icon, label, value, onChange }) {
  return (
    <div className="relative mb-8">
      <Icon size={18}
        className="absolute left-5 top-5 text-gray-400" />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          peer w-full rounded-3xl pl-12 pr-5 py-4
          bg-white/60 dark:bg-[#1a1a1a]
          border border-gray-300 dark:border-white/10
          outline-none text-sm
          focus:border-red-500 focus:ring-2 focus:ring-red-500/20
          transition-all
        "
        placeholder=" "
      />

      <label
        className="
          absolute left-12 top-4 text-sm text-gray-500
          pointer-events-none transition-all
          peer-placeholder-shown:top-5
          peer-placeholder-shown:text-gray-400
          peer-focus:top-1
          peer-focus:text-xs
          peer-focus:text-red-600
        "
      >
        {label}
      </label>
    </div>
  );
}