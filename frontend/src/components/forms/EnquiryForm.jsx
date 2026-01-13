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

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit enquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-md mx-auto"
    >
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
              shadow-md
            "
          >
            <CheckCircle size={20} />
            Enquiry submitted. Our consultant will call you shortly.
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={submit}
        className="
          relative rounded-[2.5rem] p-8
          bg-white/80 dark:bg-[#121212]/80
          backdrop-blur-xl
          border border-gray-200 dark:border-white/10
          shadow-[0_20px_60px_rgba(0,0,0,0.15)]
        "
      >
        {/* HEADER */}
        <div className="mb-10">
          <h3 className="text-2xl font-extrabold tracking-wide">
            Request a Call Back
          </h3>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Speak directly with our interior design consultant
          </p>

          <span className="
            block mt-4 w-16 h-[3px]
            bg-gradient-to-r from-red-600 to-yellow-400
            rounded-full
          " />
        </div>

        {/* INPUTS */}
        <Field
          label="Your Name"
          icon={User}
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />

        <Field
          label="Phone Number"
          icon={Phone}
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />

        <Field
          label="City"
          icon={MapPin}
          value={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
        />

        {/* MESSAGE */}
        <div className="mb-7">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message <span className="opacity-60">(Optional)</span>
          </label>

          <div className="relative group">
            <MessageCircle
              size={16}
              className="absolute left-4 top-4 text-gray-400"
            />
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              className="
                w-full rounded-2xl pl-11 pr-4 py-3.5
                bg-gray-50 dark:bg-[#1a1a1a]
                border border-gray-300 dark:border-white/10
                outline-none text-sm resize-none
                focus:border-red-500 focus:ring-2 focus:ring-red-500/20
                transition-all
              "
              placeholder="Tell us briefly about your requirement"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-3
            py-4 rounded-2xl font-semibold tracking-wide
            bg-gradient-to-r from-red-600 to-red-700
            text-white text-sm
            shadow-lg shadow-red-600/30
            hover:shadow-red-600/50
            transition disabled:opacity-60
          "
        >
          {loading ? "Submitting…" : (
            <>
              <Send size={18} /> Submit Enquiry
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* INPUT FIELD */
function Field({ label, icon: Icon, value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className="relative group">
        <Icon size={16} className="absolute left-4 top-4 text-gray-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full rounded-2xl pl-11 pr-4 py-3.5
            bg-gray-50 dark:bg-[#1a1a1a]
            border border-gray-300 dark:border-white/10
            outline-none text-sm
            focus:border-red-500 focus:ring-2 focus:ring-red-500/20
            transition-all
          "
          placeholder={label}
        />
      </div>
    </div>
  );
}
