import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const token = localStorage.getItem("userToken");
  const phone = localStorage.getItem("userPhone");
  const name = localStorage.getItem("userName");

  const [open, setOpen] = useState(false);

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
      className="
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        w-[92%] max-w-7xl
        rounded-2xl backdrop-blur-xl
        bg-white/30 dark:bg-black/40
        border border-white/40 dark:border-white/10
        shadow-lg px-6 py-3
      "
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        {/* LOGO */}
        <h1
          onClick={() => navigate("/")}
          className="
            text-2xl font-black cursor-pointer
            bg-gradient-to-r from-orange-500 to-yellow-300
            bg-clip-text text-transparent
          "
        >
          Interiors
        </h1>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map((l) => (
            <li key={l.path}>
              <NavLink
                to={l.path}
                className={({ isActive }) =>
                  `transition hover:text-orange-500 ${
                    isActive ? "text-orange-500 font-semibold" : ""
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}

          {token && (
            <NavLink to="/products" className="hover:text-orange-500">
              Products
            </NavLink>
          )}
        </ul>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-4">
          {/* THEME */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="
              p-2 rounded-lg
              bg-white/20 dark:bg-white/5
              hover:scale-105 transition
            "
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AUTH (DESKTOP) */}
          {!token ? (
            <div className="hidden md:flex gap-4 text-sm">
              <NavLink to="/login" className="hover:text-orange-500">
                Login
              </NavLink>
              <NavLink to="/register" className="hover:text-orange-500">
                Register
              </NavLink>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm opacity-80">
                👋 {name || phone}
              </span>
              <button
                onClick={logout}
                className="text-orange-500 font-semibold hover:text-orange-600"
              >
                Logout
              </button>
            </div>
          )}

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-orange-500"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div
          className="
            mt-4 md:hidden
            bg-white/80 dark:bg-black/80
            backdrop-blur-xl rounded-xl
            p-5 flex flex-col gap-4
            border border-white/30 dark:border-white/10
          "
        >
          {links.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className="text-sm hover:text-orange-500"
            >
              {l.label}
            </NavLink>
          ))}

          {token && (
            <NavLink
              to="/products"
              onClick={() => setOpen(false)}
              className="hover:text-orange-500"
            >
              Products
            </NavLink>
          )}

          <div className="h-px bg-gray-300 dark:bg-gray-700 my-2" />

          {!token ? (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Login
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>
                Register
              </NavLink>
            </>
          ) : (
            <button
              onClick={logout}
              className="text-orange-500 font-semibold text-left"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
