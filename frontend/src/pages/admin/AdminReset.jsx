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

  const reset = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (password.length < 6) {
      return setError("Password must be 6+ chars");
    }

    try {
      await api.post(`/admin/reset-password/${token}`, { password });
      setMsg("Password reset successful. You can login now.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
      <form
        onSubmit={reset}
        className="bg-[#141414] p-8 rounded-xl w-full max-w-md border border-[#222]"
      >
        <h2 className="text-2xl font-bold text-[#ff6b00] mb-4 text-center">
          Set New Password
        </h2>

        {error && <p className="text-red-400 mb-3">{error}</p>}
        {msg && <p className="text-green-400 mb-3">{msg}</p>}

        <div className="flex gap-2 bg-[#1b1b1b] p-2 rounded mb-4">
          <LockKeyhole size={18} />
          <input
            type="password"
            className="bg-transparent w-full outline-none"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#ff6b00] text-black py-2 rounded font-semibold"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
