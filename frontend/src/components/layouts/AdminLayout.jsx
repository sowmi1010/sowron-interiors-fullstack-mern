import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
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
  Mail
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
    <div className="flex min-h-screen bg-[#0D0D0D] text-white font-poppins">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#101010]/90 backdrop-blur-xl border-r border-[#1f1f1f] flex flex-col p-6 shadow-lg">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10 px-1">
          <img src="/logo.png" alt="logo" className="w-9 h-9 rounded-lg" />
          <h2 className="text-lg font-semibold text-[#ff6b00] tracking-wide">Interiors</h2>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1 text-[#bdbdbd] text-sm font-medium">
          {[
            { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            { to: "/admin/categories", label: "Categories", icon: <Package size={18} /> },
            { to: "/admin/products", label: "Product", icon: <Package size={18} /> },
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
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#ff6b00] to-[#ffa200] text-black font-semibold shadow-md"
                    : "hover:bg-[#1b1b1b] hover:text-white"
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="mt-auto flex items-center justify-center gap-2 bg-[#d32f2f] hover:bg-[#ff4040] 
                     transition-all duration-300 text-white py-2 rounded-lg shadow-lg"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* TOP NAVBAR */}
        <header className="w-full px-6 py-3 sticky top-0 z-20 
                           bg-[#131313]/95 backdrop-blur border-b border-[#1f1f1f] shadow-md
                           flex justify-between items-center">
          {/* Back/Forward */}
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="px-3 py-1 bg-[#1c1c1c] rounded text-xs flex items-center gap-1 hover:bg-[#252525] transition shadow">
              <ChevronLeft size={14} /> Back
            </button>
            <button onClick={() => navigate(1)} className="px-3 py-1 bg-[#1c1c1c] rounded text-xs flex items-center gap-1 hover:bg-[#252525] transition shadow">
              <ChevronRight size={14} /> Forward
            </button>
          </div>

          {/* Search */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            className="bg-[#1a1a1a] px-4 py-2 rounded text-sm outline-none border border-[#2a2a2a] w-72
                       focus:border-[#ff6b00] transition placeholder:text-gray-500"
          />

          {/* Bell + name */}
          <div className="flex items-center gap-4">
            <Bell size={20} className="text-gray-300 hover:text-[#ff6b00] cursor-pointer transition-all" />
            <span className="text-sm text-[#ff6b00] font-semibold capitalize">Welcome, {adminName}</span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-6 animate-fade">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
