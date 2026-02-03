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

export default function EnquiryForm({ projectId, projectTitle, projectLocation }) {
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
        projectId,
        projectTitle,
        projectLocation,
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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative max-w-xl mx-auto"
    >
      <div className="absolute -inset-6 rounded-[3.5rem]
        bg-gradient-to-b from-red-500/10 via-orange-400/10 to-transparent
        blur-3xl opacity-70" />

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

      <form
        onSubmit={submit}
        className="
          relative rounded-[3.2rem] p-10 sm:p-12
          bg-[#f9f6f3] dark:bg-[#151515]
          border border-black/5 dark:border-white/10
          shadow-[0_35px_90px_rgba(0,0,0,0.18)]
        "
      >
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            Share your details
          </p>
          <h3 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Book a Free Consultation
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Talk directly with our interior design expert
          </p>
          <span className="block mx-auto mt-6 w-16 h-[3px]
            bg-gradient-to-r from-red-600 to-yellow-400 rounded-full" />
        </div>

        <PillField
          icon={User}
          label="Full Name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        <PillField
          icon={Phone}
          label="Phone Number"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />

        <PillField
          icon={MapPin}
          label="City"
          value={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
        />

        <div className="mb-10 relative">
          <MessageCircle size={18}
            className="absolute left-6 top-5 text-gray-400" />

          <textarea
            rows={4}
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            className="
              w-full rounded-[1.8rem] pl-12 pr-6 py-4
              bg-white dark:bg-[#1a1a1a]
              border border-gray-300/80 dark:border-white/10
              outline-none resize-none text-sm
              focus:border-red-500 focus:ring-2 focus:ring-red-500/20
              transition-all
            "
            placeholder="Tell us about your project (optional)"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-3
            py-4 sm:py-5 rounded-full font-semibold tracking-wide
            bg-gradient-to-r from-red-600 to-red-700
            text-white text-sm
            shadow-[0_20px_40px_rgba(220,38,38,0.45)]
            hover:shadow-[0_24px_48px_rgba(220,38,38,0.6)]
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

/* ================= PILL FIELD ================= */

function PillField({ icon: Icon, label, value, onChange }) {
  return (
    <div className="relative mb-6">
      <Icon size={18} className="absolute left-6 right-3 top-4 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-full pl-12 pr-6 py-3.5
          bg-white dark:bg-[#1a1a1a]
          border border-gray-300/80 dark:border-white/10
          outline-none text-sm
          focus:border-red-500 focus:ring-2 focus:ring-red-500/20
          transition-all
        "
        placeholder={label}
      />
    </div>
  );
}
