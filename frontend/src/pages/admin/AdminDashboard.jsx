import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  FileText,
  Home,
  Star,
  UserCircle,
  Image,
  X,
  Activity,
  TrendingUp,
  BarChart3,
  Layers,
} from "lucide-react";
import AnimatedCounter from "../../components/ui/AnimatedCounter.jsx";
import { socket } from "../../lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [bookingStatus, setBookingStatus] = useState({});
  const [activity, setActivity] = useState([]);
  const [topCities, setTopCities] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [trends, setTrends] = useState({});
  const [drawer, setDrawer] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("week");
  const navigate = useNavigate();

  /* ================= LOAD DATA ================= */
  const load = async () => {
    try {
      const countsRes = await api.get("/dashboard/counts");
      const payload = countsRes.data || {};
      setCounts(payload.counts || {});
      setBookingStatus(payload.bookingStatus || {});
      setActivity(payload.activity || []);
      setTopCities(payload.topCities || []);
      setTopCategories(payload.topCategories || []);
      setTrends(payload.trends || {});
    } catch {
      localStorage.removeItem("adminName");
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
    {
      label: "Bookings",
      value: counts.bookings || 0,
      icon: Calendar,
      link: "/admin/bookings",
      trend: trends.bookings?.change,
    },
    {
      label: "Enquiries",
      value: counts.enquiries || 0,
      icon: Activity,
      link: "/admin/enquiries",
      trend: trends.enquiries?.change,
    },
    {
      label: "Estimates",
      value: counts.estimates || 0,
      icon: FileText,
      link: "/admin/estimates",
      trend: trends.estimates?.change,
    },
    {
      label: "Feedback",
      value: counts.feedback || 0,
      icon: Star,
      link: "/admin/feedback",
    },
  ];

  const filteredActivity = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (filter === "today") start.setHours(0, 0, 0, 0);
    if (filter === "week") start.setDate(start.getDate() - 7);
    if (filter === "month") start.setDate(start.getDate() - 30);
    if (filter === "all") return activity;
    return activity.filter((a) => new Date(a.createdAt) >= start);
  }, [activity, filter]);

  return (
    <div className="text-white">

      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold text-brand-red">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Business overview & premium insights
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
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
                {typeof s.trend === "number" && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        s.trend >= 0
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {s.trend >= 0 ? "+" : ""}
                      {s.trend}%
                    </span>
                    <span className="text-gray-500">last 7 days</span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red">
                <s.icon size={28} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* PIPELINE + QUICK ACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        <div className="xl:col-span-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">Booking Pipeline</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <BarChart3 size={14} /> Status overview
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pending", value: bookingStatus.pending || 0, tone: "yellow" },
              { label: "Confirmed", value: bookingStatus.confirmed || 0, tone: "blue" },
              { label: "Completed", value: bookingStatus.completed || 0, tone: "green" },
              { label: "Cancelled", value: bookingStatus.cancelled || 0, tone: "red" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4 bg-white/5 border border-white/10"
              >
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-2xl font-bold mt-2">{s.value}</p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full ${
                      s.tone === "yellow"
                        ? "bg-yellow-400"
                        : s.tone === "blue"
                        ? "bg-blue-400"
                        : s.tone === "green"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                    style={{
                      width: `${
                        Math.min(
                          100,
                          Math.round(
                            (s.value / Math.max(1, counts.bookings || 1)) * 100
                          )
                        )
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/gallery"
              className="flex items-center justify-center gap-2 py-3 rounded-lg
                         bg-brand-red text-white font-semibold hover:bg-brand-redDark transition"
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

            <Link
              to="/admin/enquiries"
              className="flex items-center justify-center gap-2 py-3 rounded-lg
                         bg-white/5 hover:bg-white/10 transition"
            >
              <Layers size={18} /> View Enquiries
            </Link>
          </div>
        </div>
      </div>

      {/* INSIGHTS + ACTIVITY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Cities</h3>
            <TrendingUp size={16} className="text-brand-yellow" />
          </div>
          <div className="space-y-3">
            {(topCities.length ? topCities : []).map((c) => (
              <div key={c.city} className="flex justify-between text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                <span className="capitalize">{c.city}</span>
                <span className="text-brand-yellow font-semibold">{c.count}</span>
              </div>
            ))}
            {!topCities.length && (
              <p className="text-sm text-gray-500">No city data yet</p>
            )}
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Categories</h3>
            <TrendingUp size={16} className="text-brand-yellow" />
          </div>
          <div className="space-y-3">
            {(topCategories.length ? topCategories : []).map((c) => (
              <div key={c.id} className="flex justify-between text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                <span>{c.name}</span>
                <span className="text-brand-yellow font-semibold">{c.count}</span>
              </div>
            ))}
            {!topCategories.length && (
              <p className="text-sm text-gray-500">No category data yet</p>
            )}
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Activity</h3>
            <div className="flex items-center gap-2">
              {["today", "week", "month", "all"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    filter === f
                      ? "border-brand-yellow text-brand-yellow"
                      : "border-white/10 text-gray-400"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {filteredActivity.map((a, i) => (
              <div
                key={`${a.type}-${i}`}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-sm text-brand-yellow font-medium">{a.label}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {a.city || "Unknown city"} - {a.status || "new"}
                </p>
              </div>
            ))}
            {!filteredActivity.length && (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
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
