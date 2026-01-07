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
      const countsRes = await api.get("/admin/counts");
      setData(countsRes.data);

      const bookingRes = await api.get("/booking");
      setLatest((bookingRes.data || []).slice(0, 5));
    } catch (err) {
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
      setNotifications((prev) => [
        { type: "New Booking", ...b },
        ...prev,
      ]);
      load();
    });

    return () => {
      socket.off("new_booking");
    };
  }, []);

  /* ================= STATS ================= */
  const stats = [
    {
      label: "Bookings",
      value: data.totalBookings || 0,
      icon: <Calendar size={32} />,
      link: "/admin/bookings",
    },
    {
      label: "Estimates",
      value: data.totalEstimates || 0,
      icon: <FileText size={32} />,
      link: "/admin/estimates",
    },
    {
      label: "Portfolio",
      value: data.totalPortfolio || 0,
      icon: <Home size={32} />,
      link: "/admin/portfolio",
    },
    {
      label: "Feedback",
      value: data.totalFeedback || 0,
      icon: <Star size={32} />,
      link: "/admin/feedback",
    },
  ];

  /* ================= CHART ================= */
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [2, 5, 4, 7, 6, 8, 9], // replace later with API
        borderColor: "#ff6b00",
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-6 text-white">
      {/* TOP BAR */}
      <div className="flex justify-end gap-6 items-center mb-6">
        <button
          className="relative hover:scale-110 transition"
          onClick={() => setDrawer(true)}
        >
          <Bell size={22} className="text-gray-300 hover:text-[#ff6b00]" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-[#ff6b00] rounded-full w-2 h-2" />
          )}
        </button>

        <div className="flex items-center gap-2 bg-[#181818] px-3 py-1.5 rounded-lg border border-[#222]">
          <UserCircle size={22} />
          <span className="text-sm">
            {localStorage.getItem("adminName") || "Admin"}
          </span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-[#ff6b00] mb-8">
        Dashboard Overview
      </h2>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <Link
            key={i}
            to={s.link}
            className="bg-[#141414] border border-[#1f1f1f] p-6 rounded-xl
            hover:shadow-[0_0_18px_rgba(255,107,0,0.35)]
            hover:-translate-y-1 transition"
          >
            <div className="text-[#ff6b00] mb-1">{s.icon}</div>
            <h3 className="text-4xl font-extrabold text-[#ff6b00]">
              <AnimatedCounter value={s.value} />
            </h3>
            <p className="text-gray-500 text-sm">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* CHART + ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-5">
          <h3 className="text-md font-semibold text-gray-300 mb-3">
            Weekly Bookings
          </h3>
          <Line data={chartData} />
        </div>

        <div className="lg:col-span-2 bg-[#141414] border border-[#1f1f1f] p-5 rounded-xl">
          <h3 className="text-md font-semibold text-gray-300 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link
              to="/admin/products"
              className="bg-[#ff6b00] text-black py-3 rounded-lg flex justify-center gap-2 font-semibold"
            >
              <PlusCircle size={18} /> Add Product
            </Link>

            <Link to="/admin/gallery" className="quick-btn">
              <Image size={18} /> Add Gallery
            </Link>

            <Link to="/admin/portfolio" className="quick-btn">
              <Home size={18} /> Add Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS */}
      <div className="bg-[#141414] border border-[#1f1f1f] p-6 rounded-xl mt-10">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        {latest.map((b) => (
          <div key={b._id} className="flex justify-between py-2 text-sm">
            <span>{b.phone}</span>
            <span>{b.city}</span>
            <span>{b.date}</span>
          </div>
        ))}
      </div>

      {/* NOTIFICATIONS */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            className="fixed top-0 right-0 w-80 h-full bg-[#0d0d0d] border-l border-[#222] p-4 z-50"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-lg text-[#ff6b00]">Notifications</h3>
              <button onClick={() => setDrawer(false)}>
                <X />
              </button>
            </div>

            {notifications.length === 0 && (
              <p className="text-gray-500 text-sm">No notifications</p>
            )}

            {notifications.map((n, i) => (
              <div key={i} className="bg-[#161616] p-3 rounded mb-2">
                <p className="text-[#ff6b00]">{n.type}</p>
                {n.phone && <p className="text-xs">📞 {n.phone}</p>}
                {n.city && <p className="text-xs">📍 {n.city}</p>}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
