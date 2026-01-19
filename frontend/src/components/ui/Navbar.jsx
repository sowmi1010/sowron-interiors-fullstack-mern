import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X, Heart } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

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

  /* ================= LOAD WISHLIST COUNT ================= */
  useEffect(() => {
    if (!token) return;

    const loadWishlist = async () => {
      try {
        const res = await api.get("/wishlist");
        setWishlistCount(res.data.length || 0);
      } catch {}
    };

    loadWishlist();
  }, [token]);

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      role="navigation"
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-[92%] max-w-7xl rounded-2xl px-6 py-3
        backdrop-blur-xl transition-all duration-300
        ${scrolled ? "bg-white/95 dark:bg-black/90 shadow-xl" : "bg-white/70 dark:bg-black/70"}
        border border-brand-yellow/30 dark:border-white/10
      `}
    >
      <div className="flex items-center justify-between">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer text-2xl font-extrabold bg-gradient-to-r from-brand-red to-brand-yellow bg-clip-text text-transparent"
        >
          Sowron<span className="opacity-80">Interiors</span>
        </div>

        {/* DESKTOP MENU */}
        <ul className="hidden lg:flex gap-10 text-sm font-medium text-black dark:text-white">
          {links.map((l) => (
            <li key={l.path}>
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-brand-red border-b-2 border-brand-red"
                    : "text-gray-800 dark:text-gray-200 hover:text-brand-yellow"
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}

          {token && (
            <>
              <NavLink to="/products" className="hover:text-brand-yellow text-black dark:text-white">
                Products
              </NavLink>

              {/* ❤️ Wishlist */}
              <NavLink to="/wishlist" className="relative">
                <Heart className="text-brand-red hover:scale-110 transition" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </ul>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* THEME */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-white/40 dark:bg-white/10 text-black dark:text-white"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AUTH */}
          {!token ? (
            <NavLink
              to="/login"
              className="hidden lg:block px-6 py-2 rounded-xl bg-brand-red text-white font-semibold"
            >
              Login
            </NavLink>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-sm">👋 {name || phone}</span>
              <button onClick={logout} className="text-brand-yellow font-semibold">
                Logout
              </button>
            </div>
          )}

          {/* MOBILE BUTTON */}
          <button onClick={() => setOpen(!open)} className="lg:hidden dark:text-white text-black">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mt-6 rounded-2xl bg-white text-black dark:text-white dark:bg-black p-6 shadow-2xl flex flex-col gap-5"
          >
            {links.map((l) => (
              <NavLink key={l.path} to={l.path} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}

            {token && (
              <>
                <NavLink to="/products" onClick={() => setOpen(false)}>
                  Products
                </NavLink>

                <NavLink to="/wishlist" onClick={() => setOpen(false)}>
                  ❤️ Wishlist ({wishlistCount})
                </NavLink>
              </>
            )}

            {!token ? (
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Login
              </NavLink>
            ) : (
              <button onClick={logout} className="text-brand-yellow">
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
