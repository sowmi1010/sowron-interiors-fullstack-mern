import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../../lib/api";

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

export default function BookingForm() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    city: "",
  });

  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD BLOCKED SLOTS ================= */
  useEffect(() => {
    if (!form.date) return;

    api
      .get("/booking/blocked-slots", { params: { date: form.date } })
      .then((res) => setBlocked(res.data || []))
      .catch(() => setBlocked([]));
  }, [form.date]);

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.date || !form.time || !form.city) {
      return toast.error("Please select date, time and city");
    }

    try {
      setLoading(true);
      await api.post("/booking/add", form);

      toast.success("Booking confirmed. Our team will contact you.");
      setForm({ date: "", time: "", city: "" });
      setBlocked([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* ================= DATE ================= */}
      <Field
        label="Preferred Date"
        icon={Calendar}
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value, time: "" })
        }
      />

      {/* ================= TIME SLOTS ================= */}
      <div>
        <label className="block mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
          Preferred Time Slot
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TIME_SLOTS.map((slot) => {
            const isBlocked = blocked.includes(slot);
            const isActive = form.time === slot;

            return (
              <motion.button
                key={slot}
                type="button"
                disabled={isBlocked}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: isBlocked ? 1 : 1.05 }}
                onClick={() =>
                  !isBlocked && setForm({ ...form, time: slot })
                }
                className={`
                  py-3 rounded-xl text-sm font-semibold
                  transition-all
                  ${
                    isBlocked
                      ? "bg-gray-200 dark:bg-[#1a1a1a] text-gray-400 cursor-not-allowed"
                      : isActive
                      ? "bg-gradient-to-r from-red-600 to-yellow-400 text-black shadow-lg"
                      : "bg-white dark:bg-[#1b1b1b] border border-gray-200 dark:border-white/10 hover:border-red-500"
                  }
                `}
              >
                <Clock size={14} className="inline mr-1" />
                {slot}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ================= CITY ================= */}
      <Field
        label="City"
        icon={MapPin}
        placeholder="Eg: Chennai"
        value={form.city}
        onChange={(e) =>
          setForm({ ...form, city: e.target.value })
        }
      />

      {/* ================= SUBMIT ================= */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        disabled={loading}
        className="
          w-full flex items-center justify-center gap-2
          py-4 rounded-2xl font-semibold text-lg
          bg-gradient-to-r from-red-600 to-red-700
          text-white
          hover:shadow-red-600/40
          transition disabled:opacity-60
        "
      >
        <Send size={18} />
        {loading ? "Booking…" : "Confirm Free Consultation"}
      </motion.button>
    </motion.form>
  );
}

/* ================= FIELD ================= */
function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="absolute left-4 top-4 text-gray-400"
        />
        <input
          {...props}
          className="
            w-full pl-12 pr-4 py-4 rounded-2xl
            bg-white dark:bg-[#1b1b1b]
            border border-gray-200 dark:border-white/10
            outline-none text-sm
            focus:border-red-500 focus:ring-2 focus:ring-red-500/20
            transition
          "
        />
      </div>
    </div>
  );
}
