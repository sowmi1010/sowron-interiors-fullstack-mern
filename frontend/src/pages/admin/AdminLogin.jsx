import { useState } from "react";
import { Mail, LockKeyhole } from "lucide-react";
import { Helmet } from "react-helmet";
import { api } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("Email & password required");
    }

    try {
      setLoading(true);

      const res = await api.post("/admin/login", { email, password });

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminName", res.data.admin.name || "Admin");

      window.location.replace("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darkBg text-white">
      <Helmet>
        <title>Admin Login</title>
      </Helmet>

      {/* GLASS CARD */}
      <form
        onSubmit={login}
        className="w-full max-w-md p-8 rounded-2xl
                   bg-black/60 backdrop-blur-xl
                   border border-white/10 shadow-glass"
      >
        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-brand-red text-center mb-6">
          Admin Login
        </h2>

        {/* ERROR */}
        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded">
            {error}
          </p>
        )}

        {/* FIELDS */}
        <div className="space-y-4">
          {/* EMAIL */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg
                          bg-white/5 border border-white/10
                          focus-within:border-brand-yellow transition">
            <Mail size={18} className="text-gray-400" />
            <input
              type="email"
              className="bg-transparent w-full outline-none text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg
                          bg-white/5 border border-white/10
                          focus-within:border-brand-yellow transition">
            <LockKeyhole size={18} className="text-gray-400" />
            <input
              type="password"
              className="bg-transparent w-full outline-none text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold
                       bg-brand-red text-white
                       hover:bg-brand-redDark
                       transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* FORGOT */}
          <p className="text-center text-sm text-gray-400 mt-4">
            <a
              href="/admin/forgot"
              className="text-brand-yellow hover:underline"
            >
              Forgot password?
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
