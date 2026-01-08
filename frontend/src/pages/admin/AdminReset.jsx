// src/pages/admin/AdminReset.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { api } from "../../lib/api";

export default function AdminReset() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await api.post(`/admin/reset-password/${token}`, { password });
      setMsg("Password reset successful. You can now login.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darkBg text-white">
      {/* GLASS CARD */}
      <form
        onSubmit={reset}
        className="w-full max-w-md p-8 rounded-2xl
                   bg-black/60 backdrop-blur-xl
                   border border-white/10 shadow-glass"
      >
        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-brand-red text-center mb-6">
          Set New Password
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

        {/* PASSWORD FIELD */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg
                     bg-white/5 border border-white/10
                     focus-within:border-brand-yellow transition"
        >
          <LockKeyhole size={18} className="text-gray-400" />
          <input
            type="password"
            className="bg-transparent w-full outline-none text-sm"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {/* BACK TO LOGIN */}
        <p className="text-center text-sm text-gray-400 mt-5">
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
