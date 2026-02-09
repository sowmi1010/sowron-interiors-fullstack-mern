import { useState, useRef } from "react";
import { Mail, LockKeyhole, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet";
import { api } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRef = useRef(null);

  const login = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("Email & password required");
    }

    try {
      setLoading(true);

      await api.post("/admin/login", { email, password });

      setStep(2);
      setOtp(""); // ✅ clear old otp
      setTimeout(() => otpRef.current?.focus(), 300);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      return setError("Enter 6-digit OTP");
    }

    try {
      setLoading(true);

      const res = await api.post("/admin/verify-otp", { email, otp });

      // ✅ IMPORTANT: store admin token (needed for cloud)
      const token = res.data?.token;
      if (!token) {
        return setError("Token not received from server. Please try again.");
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminName", res.data.admin?.name || "Admin");

      // ✅ go to admin page
      window.location.href = "/admin";
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darkBg text-white">
      <Helmet>
        <title>Admin Login | Sowro Interiors</title>
      </Helmet>

      <form
        onSubmit={step === 1 ? login : verifyOtp}
        className="w-full max-w-md p-8 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-glass"
      >
        <h2 className="text-2xl font-semibold text-brand-red text-center mb-6">
          Admin Login
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
            <Mail size={18} className="text-gray-400" />
            <input
              type="email"
              className="bg-transparent w-full outline-none text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {step === 1 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <LockKeyhole size={18} className="text-gray-400" />
              <input
                type="password"
                className="bg-transparent w-full outline-none text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <ShieldCheck size={18} className="text-gray-400" />
              <input
                ref={otpRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="bg-transparent w-full outline-none text-sm tracking-[0.3em] text-center"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-brand-red text-white hover:bg-brand-redDark transition disabled:opacity-60"
          >
            {loading
              ? step === 1
                ? "Sending OTP..."
                : "Verifying..."
              : step === 1
              ? "Login"
              : "Verify OTP"}
          </button>

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
