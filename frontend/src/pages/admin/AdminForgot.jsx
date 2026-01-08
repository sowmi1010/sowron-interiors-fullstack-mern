// src/pages/admin/AdminForgot.jsx
import { useState } from "react";
import { Mail } from "lucide-react";
import { Helmet } from "react-helmet";
import { api } from "../../lib/api";

export default function AdminForgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email) return setError("Email required");

    try {
      setLoading(true);
      await api.post("/admin/forgot-password", { email });
      setMsg("Password reset link sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darkBg text-white">
      <Helmet>
        <title>Admin Forgot Password</title>
      </Helmet>

      {/* GLASS CARD */}
      <form
        onSubmit={submit}
        className="w-full max-w-md p-8 rounded-2xl
                   bg-black/60 backdrop-blur-xl
                   border border-white/10 shadow-glass"
      >
        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-brand-red text-center mb-6">
          Reset Admin Password
        </h2>

        {/* ERROR */}
        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded">
            {error}
          </p>
        )}

        {/* SUCCESS */}
        {msg && (
          <p className="mb-4 text-sm text-green-400 bg-green-400/10 px-3 py-2 rounded">
            {msg}
          </p>
        )}

        {/* EMAIL FIELD */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     focus-within:border-brand-yellow transition"
        >
          <Mail size={18} className="text-gray-400" />
          <input
            type="email"
            className="bg-transparent w-full outline-none text-sm"
            placeholder="Admin email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 py-3 rounded-lg font-semibold
                     bg-brand-red text-white
                     hover:bg-brand-redDark
                     transition disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* BACK TO LOGIN */}
        <p className="text-center text-sm text-gray-400 mt-5">
          Remember your password?{" "}
          <a
            href="/admin/login"
            className="text-brand-yellow hover:underline"
          >
            Back to login
          </a>
        </p>
      </form>
    </div>
  );
}
