import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

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

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-7xl glass rounded-2xl px-6 py-3"
    >
      <div className="flex items-center justify-between">
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer text-2xl font-extrabold tracking-wide
          bg-gradient-to-r from-brand-red to-brand-yellow
          bg-clip-text text-transparent animate-fadeUp"
        >
          Sowron<span className="opacity-80">Interiors</span>
        </div>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {links.map((l) => (
            <li key={l.path}>
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  `relative transition text-black dark:text-white ${
                    isActive
                      ? "text-brand-red dark:text-brand-red"
                      : "hover:text-brand-yellow"
                  }`
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
                  `relative transition text-black dark:text-white ${
                    isActive
                      ? "text-brand-red dark:text-brand-red"
                      : "hover:text-brand-yellow"
                  }`
                }
              >
                Products
              </NavLink>
            </li>
          )}
        </ul>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* THEME */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-black dark:text-white bg-white/20 dark:bg-white/10 hover:scale-110 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AUTH */}
          {!token ? (
            <NavLink to="/login" className="hidden md:block cta-btn">
              Login
            </NavLink>
          ) : (
            <div className="hidden md:flex items-center gap-3">
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
            className="md:hidden text-brand-red"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden mt-4 glass rounded-xl p-5 flex flex-col gap-4 animate-fadeUp">
          {links.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className="hover:text-brand-yellow"
            >
              {l.label}
            </NavLink>
          ))}

          {token && (
            <NavLink
              to="/products"
              onClick={() => setOpen(false)}
              className="hover:text-brand-yellow"
            >
              Products
            </NavLink>
          )}

          {!token ? (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="cta-btn"
            >
              Login
            </NavLink>
          ) : (
            <button onClick={logout} className="text-brand-yellow text-left">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
