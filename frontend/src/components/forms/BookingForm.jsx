import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../../lib/api";

const TIME_SLOTS = [
  "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
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
      .get("/booking/blocked-slots", {
        params: { date: form.date },
      })
      .then((res) => setBlocked(res.data || []))
      .catch(() => setBlocked([]));
  }, [form.date]);

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.date || !form.time || !form.city) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      await api.post("/booking/add", form);

      toast.success("Booking submitted. Our team will contact you.");
      setForm({ date: "", time: "", city: "" });
      setBlocked([]);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Booking failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* DATE */}
      <Field
        label="Preferred Date"
        icon={Calendar}
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value, time: "" })
        }
      />

      {/* TIME */}
      <div>
        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-400">
          Preferred Time
        </label>

        <div className="relative">
          <Clock
            size={16}
            className="absolute left-3 top-3.5 text-gray-400"
          />
          <select
            value={form.time}
            onChange={(e) =>
              setForm({ ...form, time: e.target.value })
            }
            className="
              w-full pl-10 pr-3 py-3 rounded-xl
              bg-gray-50 dark:bg-[#1a1a1a]
              border border-gray-300 dark:border-white/10
              outline-none text-sm
              focus:border-red-500 transition
            "
          >
            <option value="">Select Time Slot</option>
            {TIME_SLOTS.map((t) => (
              <option
                key={t}
                value={t}
                disabled={blocked.includes(t)}
              >
                {t} {blocked.includes(t) ? "— Unavailable" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CITY */}
      <Field
        label="City"
        icon={MapPin}
        placeholder="Eg: Chennai"
        value={form.city}
        onChange={(e) =>
          setForm({ ...form, city: e.target.value })
        }
      />

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
        <Send size={18} />
        {loading ? "Submitting…" : "Confirm Booking"}
      </motion.button>
    </motion.form>
  );
}

/* ================= FIELD ================= */
function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block mb-2 text-sm text-gray-600 dark:text-gray-400">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-3.5 text-gray-400"
        />
        <input
          {...props}
          className="
            w-full pl-10 pr-3 py-3 rounded-xl
            bg-gray-50 dark:bg-[#1a1a1a]
            border border-gray-300 dark:border-white/10
            outline-none text-sm
            focus:border-red-500 transition
          "
        />
      </div>
    </div>
  );
}
