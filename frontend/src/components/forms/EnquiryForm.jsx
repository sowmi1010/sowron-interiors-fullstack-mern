import { useState } from "react";
import { api } from "../lib/api"; // ✅ USE CENTRAL API
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

      setTimeout(() => setSuccess(false), 2500);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto"
    >
      {/* ✅ SUCCESS MESSAGE */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 flex items-center gap-2
                     text-green-700 bg-green-100
                     dark:bg-green-800 dark:text-white
                     rounded-xl text-sm"
        >
          <CheckCircle size={18} />
          Enquiry submitted! Our team will call you shortly.
        </motion.div>
      )}

      <form
        onSubmit={submit}
        className="
          rounded-2xl p-8 backdrop-blur-xl
          bg-white/40 dark:bg-black/40
          border border-white/40 dark:border-white/10
          shadow-lg transition-all duration-300
          hover:shadow-[0_0_25px_rgba(255,160,60,0.25)]
        "
      >
        <h3 className="text-2xl font-black mb-6
          bg-gradient-to-r from-orange-500 to-yellow-300
          bg-clip-text text-transparent"
        >
          Request a Free Call Back 📞
        </h3>

        {/* INPUTS */}
        {[
          { icon: User, key: "name", label: "Your Name" },
          { icon: Phone, key: "phone", label: "Phone Number" },
          { icon: MapPin, key: "city", label: "City" },
        ].map(({ icon: Icon, key, label }) => (
          <div className="mb-5 relative" key={key}>
            <Icon size={17} className="absolute left-3 top-[14px] text-gray-400" />
            <input
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
              className="
                w-full p-3 pl-10 rounded-xl
                bg-white/50 dark:bg-black/30
                dark:text-gray-200
                border border-gray-300 dark:border-gray-700
                outline-none text-sm focus:border-orange-500
                transition
              "
              placeholder={label}
            />
          </div>
        ))}

        {/* MESSAGE */}
        <div className="mb-6 relative">
          <MessageCircle
            size={18}
            className="absolute left-3 top-[14px] text-gray-400"
          />
          <textarea
            rows={3}
            placeholder="Write your message…"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            className="
              w-full p-3 pl-10 rounded-xl
              bg-white/50 dark:bg-black/30
              dark:text-gray-200
              border border-gray-300 dark:border-gray-700
              outline-none text-sm focus:border-orange-500
              transition
            "
          />
        </div>

        {/* SUBMIT */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          disabled={loading}
          className="
            w-full py-3 rounded-xl font-semibold
            flex justify-center gap-2 items-center
            bg-gradient-to-r from-orange-500 to-yellow-400
            text-black hover:shadow-lg
            transition disabled:opacity-50
          "
        >
          {loading ? "Sending..." : (
            <>
              <Send size={18} /> Submit Enquiry
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
