import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext.jsx";
import {
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  Image,
  Home,
  FileText,
  Calendar,
  Star,
  Mail,
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { query, setQuery } = useSearch();
  const adminName = localStorage.getItem("adminName") || "Admin";

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    navigate("/admin/login");
  };

  return (
    <div className="bg-brand-darkBg text-white font-poppins">

      {/* ================= SIDEBAR (FIXED) ================= */}
      <aside
        className="fixed left-0 top-0 h-screen w-64
                   bg-black/60 backdrop-blur-xl
                   border-r border-white/10
                   flex flex-col p-6
                   shadow-glass z-30"
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="logo" className=" rounded-lg" />
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1 text-gray-400 text-sm font-medium">
          {[
            { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { to: "/admin/categories", label: "Categories", icon: <Package size={18} /> },
            { to: "/admin/gallery", label: "Gallery", icon: <Image size={18} /> },
            { to: "/admin/portfolio", label: "Portfolio", icon: <Home size={18} /> },
            { to: "/admin/estimates", label: "Estimates", icon: <FileText size={18} /> },
            { to: "/admin/bookings", label: "Bookings", icon: <Calendar size={18} /> },
            { to: "/admin/feedback", label: "Feedback", icon: <Star size={18} /> },
            { to: "/admin/enquiries", label: "Enquiries", icon: <Mail size={18} /> },
          ].map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                ${
                  isActive
                    ? "bg-brand-red text-white shadow-glass"
                    : "hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {/* ACTIVE LEFT INDICATOR */}
              <span
                className={`absolute left-0 top-2 h-6 w-1 rounded-r
                ${
                  window.location.pathname === item.to
                    ? "bg-brand-yellow"
                    : "bg-transparent"
                }`}
              />
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="mt-auto flex items-center justify-center gap-2
                     border border-brand-red text-brand-red
                     hover:bg-brand-red hover:text-white
                     transition py-2 rounded-lg"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="ml-64">

        {/* ================= TOP BAR (FIXED) ================= */}
        <header
          className="fixed top-0 left-64 right-0 h-14
                     bg-black/50 backdrop-blur-xl
                     border-b border-white/10
                     flex justify-between items-center px-6
                     z-20"
        >
          {/* Back / Forward */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1 rounded bg-white/5 hover:bg-white/10
                         text-xs flex items-center gap-1 transition"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={() => navigate(1)}
              className="px-3 py-1 rounded bg-white/5 hover:bg-white/10
                         text-xs flex items-center gap-1 transition"
            >
              <ChevronRight size={14} /> Forward
            </button>
          </div>

          {/* SEARCH */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="bg-white/5 backdrop-blur px-4 py-2 rounded-lg
                       text-sm outline-none border border-white/10 w-72
                       focus:border-brand-yellow transition
                       placeholder:text-gray-500"
          />

          {/* USER */}
          <div className="flex items-center gap-4">
            <Bell
              size={20}
              className="text-gray-400 hover:text-brand-yellow cursor-pointer transition"
            />
            <span className="text-sm font-semibold text-brand-yellow">
              {adminName}
            </span>
          </div>
        </header>

        {/* ================= CONTENT (SCROLL ONLY HERE) ================= */}
        <main className="pt-20 p-6 min-h-screen overflow-y-auto animate-fadeUp">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
