import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const token = localStorage.getItem("userToken");
  const name = localStorage.getItem("userName");
  const phone = localStorage.getItem("userPhone");

  const logout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const links = [
    { path: "/", label: "Home" },
    { path: "/gallery", label: "Gallery" },
    { path: "/commercial", label: "Commercial" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/book-demo", label: "Book Demo" },
    { path: "/estimate", label: "Estimate" },
  ];

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-[94%] max-w-7xl
        rounded-2xl px-6 py-3
        backdrop-blur-xl
        transition-all duration-300
        ${
          scrolled
            ? "bg-white/90 dark:bg-black/85 shadow-2xl"
            : "bg-white/70 dark:bg-black/60"
        }
        border border-red-500/20
      `}
    >
      <div className="flex items-center justify-between">

        {/* ================= LOGO ================= */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer text-2xl font-extrabold tracking-tight
            bg-gradient-to-r from-red-600 to-red-900
            bg-clip-text text-transparent"
        >
          Sowron<span className="opacity-70">Interiors</span>
        </div>

        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden lg:flex items-center gap-10 text-sm font-medium">
          {links.map((l) => (
            <li key={l.path}>
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-red-600 border-b-2 border-red-600 pb-1"
                    : "text-gray-800 dark:text-gray-200 hover:text-red-500 transition"
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-4">

          {/* THEME */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-black dark:text-white bg-white/40 dark:bg-white/10
              hover:scale-110 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AUTH */}
          {!token ? (
            <NavLink
              to="/login"
              className="hidden lg:block px-6 py-2 rounded-xl
                bg-gradient-to-r from-red-600 to-red-800
                text-white font-semibold shadow-lg"
            >
              Login
            </NavLink>
          ) : (
            <div className="hidden text-black dark:text-white lg:flex items-center gap-3 text-sm">
              <span className="opacity-80">👋 {name || phone}</span>
              <button
                onClick={logout}
                className="text-red-500 font-semibold hover:underline"
              >
                Logout
              </button>
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-black dark:text-white rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="
              lg:hidden mt-6 rounded-2xl
              bg-white text-black dark:text-white dark:bg-black
              p-6 shadow-2xl
              flex flex-col gap-5
            "
          >
            {links.map((l) => (
              <NavLink
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className="text-md font-medium"
              >
                {l.label}
              </NavLink>
            ))}

      

            {!token ? (
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Login
              </NavLink>
            ) : (
              <button onClick={logout} className="text-red-500 font-semibold">
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
