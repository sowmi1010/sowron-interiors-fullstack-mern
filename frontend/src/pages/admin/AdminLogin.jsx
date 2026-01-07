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

      // ✅ STORE RAW JWT TOKEN (NO btoa)
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
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
      <Helmet>
        <title>Admin Login</title>
      </Helmet>

      <form
        onSubmit={login}
        className="bg-[#141414] p-8 rounded-xl w-full max-w-md border border-[#222]"
      >
        <h2 className="text-2xl font-bold text-[#ff6b00] mb-4 text-center">
          Admin Login
        </h2>

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <div className="space-y-4">
          <div className="flex gap-2 bg-[#1b1b1b] p-2 rounded">
            <Mail size={18} />
            <input
              type="email"
              className="bg-transparent w-full outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-2 bg-[#1b1b1b] p-2 rounded">
            <LockKeyhole size={18} />
            <input
              type="password"
              className="bg-transparent w-full outline-none"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6b00] text-black py-2 rounded font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="mt-4 text-center text-sm text-gray-400">
            <a href="/admin/forgot" className="text-orange-400 hover:underline">
              Forgot password?
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
