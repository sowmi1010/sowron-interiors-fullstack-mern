import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../../lib/api"; // ✅ IMPORTANT

const TIME_SLOTS = [
  "10:00","11:00","12:00",
  "14:00","15:00","16:00","17:00"
];

export default function BookingForm() {
  const [form, setForm] = useState({
    date: "",
    time: "",
    city: "",
  });

  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= BLOCKED SLOTS ================= */
  useEffect(() => {
    if (!form.date) return;

    api
      .get(`/booking/blocked-slots`, {
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

      await api.post(`/booking/add`, form);

      toast.success("🎉 Booking submitted successfully!");
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* DATE */}
      <Field
        label="Choose Date"
        icon={<Calendar size={18} />}
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value, time: "" })
        }
      />

      {/* TIME */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Choose Time
        </label>

        <div className="relative">
          <Clock size={18} className="absolute left-3 top-3.5 text-gray-400" />
          <select
            value={form.time}
            onChange={(e) =>
              setForm({ ...form, time: e.target.value })
            }
            className="w-full pl-10 pr-3 py-3 rounded-xl
              bg-white dark:bg-[#111]
              border border-gray-300 dark:border-gray-700
              focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select Time</option>

            {TIME_SLOTS.map((t) => (
              <option
                key={t}
                value={t}
                disabled={blocked.includes(t)}
              >
                {t} {blocked.includes(t) ? "⛔ Booked" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CITY */}
      <Field
        label="Your City"
        icon={<MapPin size={18} />}
        placeholder="Eg: Chennai"
        value={form.city}
        onChange={(e) =>
          setForm({ ...form, city: e.target.value })
        }
      />

      {/* SUBMIT */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold
          flex items-center justify-center gap-2
          bg-gradient-to-r from-orange-500 to-yellow-400
          text-black disabled:opacity-50"
      >
        <Send size={18} />
        {loading ? "Booking..." : "Submit Booking"}
      </motion.button>
    </motion.form>
  );
}

/* ================= FIELD ================= */
function Field({ label, icon, ...props }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-3 top-3.5 text-gray-400">
          {icon}
        </span>
        <input
          {...props}
          className="w-full pl-10 pr-3 py-3 rounded-xl
            bg-white dark:bg-[#111]
            border border-gray-300 dark:border-gray-700
            focus:ring-2 focus:ring-orange-500"
        />
      </div>
    </div>
  );
}
