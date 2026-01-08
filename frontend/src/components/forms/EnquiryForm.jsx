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
import { motion } from "framer-motion";
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
      toast.error(
        err.response?.data?.message || "Failed to submit enquiry"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      {/* SUCCESS */}
      {success && (
        <div className="
          mb-6 flex items-center gap-2
          rounded-xl p-4 text-sm
          bg-green-100 text-green-700
          dark:bg-green-900/40 dark:text-green-200
        ">
          <CheckCircle size={18} />
          Enquiry submitted. Our consultant will call you shortly.
        </div>
      )}

      <form
        onSubmit={submit}
        className="
          rounded-3xl p-8
          bg-white dark:bg-[#121212]
          border border-gray-200 dark:border-white/10
          shadow-xl
        "
      >
        {/* HEADER */}
        <div className="mb-8">
          <h3 className="text-2xl font-extrabold text-center">
            Request a Call Back
          </h3>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            Speak directly with our interior design consultant
          </p>

          <span className="
            block mx-auto mt-4 w-16 h-[3px]
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
        <div className="mb-6">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Message <span className="opacity-60">(Optional)</span>
          </label>

          <div className="relative">
            <MessageCircle
              size={16}
              className="absolute left-3 top-3 text-gray-400"
            />
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              className="
                w-full rounded-xl pl-10 p-3
                bg-gray-50 dark:bg-[#1a1a1a]
                border border-gray-300 dark:border-white/10
                outline-none text-sm
                focus:border-red-500 transition
              "
              placeholder="Tell us briefly about your requirement"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-2
            py-3 rounded-xl font-semibold
            bg-gradient-to-r from-red-600 to-red-700
            text-white
            hover:shadow-red-600/40
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
    <div className="mb-5">
      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
        {label}
      </label>

      <div className="relative">
        <Icon size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full rounded-xl pl-10 p-3
            bg-gray-50 dark:bg-[#1a1a1a]
            border border-gray-300 dark:border-white/10
            outline-none text-sm
            focus:border-red-500 transition
          "
          placeholder={label}
        />
      </div>
    </div>
  );
}
