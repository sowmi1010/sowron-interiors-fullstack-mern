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
    { path: "/portfolio", label: "Portfolio" },
    { path: "/book-demo", label: "Book Demo" },
    { path: "/estimate", label: "Estimate" },
  ];

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-[92%] max-w-7xl rounded-2xl px-6 py-3
        backdrop-blur-xl transition-all duration-300
        ${
          scrolled
            ? "bg-white/95 dark:bg-black/90 shadow-xl"
            : "bg-white/70 dark:bg-black/70"
        }
        border border-brand-yellow/30 dark:border-white/10
      `}
    >
      <div className="flex items-center justify-between">
        {/* ================= LOGO ================= */}
        <div
          onClick={() => navigate("/")}
          className="
            cursor-pointer text-2xl font-extrabold tracking-wide
            bg-gradient-to-r from-brand-red to-brand-yellow
            bg-clip-text text-transparent
            hover:scale-105 transition
          "
        >
          Sowron<span className="opacity-80">Interiors</span>
        </div>

        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden lg:flex gap-10 text-sm font-medium">
          {links.map((l) => (
            <li key={l.path}>
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  `
                    relative pb-1 transition
                    ${
                      isActive
                        ? "text-brand-red after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-brand-red"
                        : "text-gray-800 dark:text-gray-200 hover:text-brand-yellow"
                    }
                  `
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}

          {token && (
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `
                    relative pb-1 transition
                    ${
                      isActive
                        ? "text-brand-red after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-brand-red"
                        : "text-gray-800 dark:text-gray-200 hover:text-brand-yellow"
                    }
                  `
                }
              >
                Products
              </NavLink>
            </li>
          )}
        </ul>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-4">
          {/* THEME */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-white/40 text-black dark:text-white dark:bg-white/10 hover:scale-110 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AUTH */}
          {!token ? (
            <NavLink
              to="/login"
              className="hidden lg:block px-6 py-2 rounded-xl bg-brand-red text-white font-semibold shadow-lg hover:scale-105 transition"
            >
              Login
            </NavLink>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-xs opacity-80 text-black dark:text-white">
                👋 {name || phone}
              </span>
              <button
                onClick={logout}
                className="text-brand-yellow font-semibold"
              >
                Logout
              </button>
            </div>
          )}

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-brand-red"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="
              lg:hidden mt-6 rounded-2xl
              bg-white/95 dark:bg-black/95
              backdrop-blur-xl border border-brand-yellow/30
              p-6 flex flex-col gap-5 shadow-2xl
            "
          >
            {links.map((l) => (
              <NavLink
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className="text-lg font-medium hover:text-brand-yellow transition"
              >
                {l.label}
              </NavLink>
            ))}

            {token && (
              <NavLink
                to="/products"
                onClick={() => setOpen(false)}
                className="text-lg font-medium hover:text-brand-yellow transition"
              >
                Products
              </NavLink>
            )}

            {!token ? (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="
                  mt-4 px-6 py-3 rounded-xl
                  bg-brand-red text-white font-semibold text-center
                  shadow-lg
                "
              >
                Login
              </NavLink>
            ) : (
              <button
                onClick={logout}
                className="mt-4 text-brand-yellow text-left font-semibold"
              >
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
