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
      setMsg("Password reset link sent to email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
      <Helmet><title>Admin Forgot Password</title></Helmet>

      <form
        onSubmit={submit}
        className="bg-[#141414] p-8 rounded-xl w-full max-w-md border border-[#222]"
      >
        <h2 className="text-2xl font-bold text-[#ff6b00] mb-4 text-center">
          Reset Admin Password
        </h2>

        {error && <p className="text-red-400 mb-3">{error}</p>}
        {msg && <p className="text-green-400 mb-3">{msg}</p>}

        <div className="flex gap-2 bg-[#1b1b1b] p-2 rounded mb-4">
          <Mail size={18} />
          <input
            type="email"
            className="bg-transparent w-full outline-none"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff6b00] text-black py-2 rounded font-semibold"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
