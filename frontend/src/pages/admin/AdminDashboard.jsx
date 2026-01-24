import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  FileText,
  Home,
  Star,
  PlusCircle,
  UserCircle,
  Image,
  X,
} from "lucide-react";
import AnimatedCounter from "../../components/ui/AnimatedCounter.jsx";
import { socket } from "../../lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import { api } from "../../lib/api";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function AdminDashboard() {
  const [data, setData] = useState({});
  const [latest, setLatest] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  /* ================= LOAD DATA ================= */
  const load = async () => {
    try {
      const countsRes = await api.get("/dashboard/counts");
      setData(countsRes.data);

      const bookingRes = await api.get("/booking");
      setLatest((bookingRes.data || []).slice(0, 5));
    } catch {
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("new_booking", (b) => {
      setNotifications((prev) => [{ type: "New Booking", ...b }, ...prev]);
      load();
    });
    return () => socket.off("new_booking");
  }, []);

  /* ================= STATS ================= */
  const stats = [
    { label: "Bookings", value: data.totalBookings || 0, icon: Calendar, link: "/admin/bookings" },
    { label: "Estimates", value: data.totalEstimates || 0, icon: FileText, link: "/admin/estimates" },
    { label: "Portfolio", value: data.totalPortfolio || 0, icon: Home, link: "/admin/portfolio" },
    { label: "Feedback", value: data.totalFeedback || 0, icon: Star, link: "/admin/feedback" },
  ];

  /* ================= CHART ================= */
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [2, 5, 4, 7, 6, 8, 9],
        borderColor: "#D32F2F",
        tension: 0.45,
        borderWidth: 3,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="text-white">

      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-brand-red">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Business overview & activity
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDrawer(true)}
            className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            <Bell />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-yellow" />
            )}
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <UserCircle />
            <span className="text-sm">
              {localStorage.getItem("adminName") || "Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <Link
            key={i}
            to={s.link}
            className="group relative rounded-2xl p-6
                       bg-black/50 backdrop-blur-xl
                       border border-white/10
                       hover:border-brand-red/50
                       transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">{s.label}</p>
                <h2 className="text-4xl font-bold text-brand-red mt-2">
                  <AnimatedCounter value={s.value} />
                </h2>
              </div>
              <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red">
                <s.icon size={28} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CHART + QUICK ACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        <div className="xl:col-span-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Bookings</h3>
          <Line data={chartData} />
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/products"
              className="flex items-center justify-center gap-2 py-3 rounded-lg
                         bg-brand-red text-white font-semibold hover:bg-brand-redDark transition"
            >
              <PlusCircle size={18} /> Add Product
            </Link>

            <Link
              to="/admin/gallery"
              className="flex items-center justify-center gap-2 py-3 rounded-lg
                         bg-white/5 hover:bg-white/10 transition"
            >
              <Image size={18} /> Add Gallery
            </Link>

            <Link
              to="/admin/portfolio"
              className="flex items-center justify-center gap-2 py-3 rounded-lg
                         bg-white/5 hover:bg-white/10 transition"
            >
              <Home size={18} /> Add Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          {latest.map((b) => (
            <div
              key={b._id}
              className="flex justify-between text-sm text-gray-300 bg-white/5 p-3 rounded-lg"
            >
              <span>{b.phone}</span>
              <span>{b.city}</span>
              <span>{b.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NOTIFICATIONS DRAWER */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            className="fixed top-0 right-0 w-96 h-full
                       bg-black/80 backdrop-blur-xl
                       border-l border-white/10
                       p-6 z-50"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-brand-red">
                Notifications
              </h3>
              <button onClick={() => setDrawer(false)}>
                <X />
              </button>
            </div>

            {notifications.length === 0 && (
              <p className="text-gray-400 text-sm">No notifications</p>
            )}

            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="text-brand-yellow font-medium">{n.type}</p>
                  {n.phone && <p className="text-xs mt-1">📞 {n.phone}</p>}
                  {n.city && <p className="text-xs">📍 {n.city}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
