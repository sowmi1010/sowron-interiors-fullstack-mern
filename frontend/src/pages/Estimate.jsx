import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Wallet, FileUp, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api"; // ✅ IMPORTANT

export default function Estimate() {
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    city: "",
    homeType: "",
    budget: "",
    requirements: "",
    file: null,
  });

  /* 🔐 PROTECT PAGE */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const next = () => {
    if (step === 1 && (!form.city || !form.homeType)) return;
    if (step === 2 && !form.budget) return;
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  /* 🚀 SUBMIT ESTIMATE */
  const submit = async () => {
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("city", form.city);
      fd.append("homeType", form.homeType);
      fd.append("budget", form.budget);
      fd.append("requirements", form.requirements || "");
      if (form.file) fd.append("file", form.file);

      // ✅ CORRECT API CALL (NO /api/api)
      await api.post("/estimate/send", fd);

      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center
      bg-[url('/interior-bg.jpg')] bg-cover bg-center bg-fixed
      relative overflow-hidden px-4 py-24 dark:bg-black"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10
        dark:from-black/60 dark:to-black/40 backdrop-blur-xl"
      />

      <AnimatedBubbles />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-xl rounded-2xl p-10
        border border-white/30 dark:border-white/10
        bg-white/15 dark:bg-black/30 backdrop-blur-xl
        shadow-[0_0_35px_rgba(255,165,0,0.25)]"
      >
        {submitted ? (
          <SuccessScreen />
        ) : (
          <>
            <h2
              className="text-4xl font-extrabold text-center mb-8
              bg-gradient-to-r from-orange-500 to-yellow-300
              bg-clip-text text-transparent"
            >
              Get Your Interior Estimate
            </h2>

            <Stepper step={step} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <Step1 form={form} setForm={setForm} next={next} />
              )}
              {step === 2 && (
                <Step2
                  form={form}
                  setForm={setForm}
                  next={next}
                  back={back}
                />
              )}
              {step === 3 && (
                <Step3
                  form={form}
                  setForm={setForm}
                  submit={submit}
                  back={back}
                  loading={loading}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
}

/* ---------------- STEPPER ---------------- */
function Stepper({ step }) {
  const steps = [Home, Wallet, FileUp];
  return (
    <div className="flex justify-between mb-12 relative">
      {steps.map((Icon, i) => (
        <div
          key={i}
          className={`w-11 h-11 flex items-center justify-center rounded-full
          ${
            step >= i + 1
              ? "bg-gradient-to-r from-orange-500 to-yellow-400"
              : "bg-gray-400 dark:bg-gray-700"
          }`}
        >
          <Icon size={18} />
        </div>
      ))}
      <div className="absolute top-[22px] left-0 w-full h-[2px] bg-gray-300 dark:bg-gray-700" />
    </div>
  );
}

/* ---------------- STEPS ---------------- */
function Step1({ form, setForm, next }) {
  return (
    <motion.div>
      <Input
        label="City"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      />

      <Select
        label="Home Type"
        value={form.homeType}
        onChange={(e) => setForm({ ...form, homeType: e.target.value })}
        options={["1 BHK", "2 BHK", "3 BHK", "Villa"]}
      />

      <NextButton onClick={next} />
    </motion.div>
  );
}

function Step2({ form, setForm, back, next }) {
  return (
    <motion.div>
      <Select
        label="Budget"
        value={form.budget}
        onChange={(e) => setForm({ ...form, budget: e.target.value })}
        options={["₹1.5–3L", "₹3–6L", "₹6–10L", "₹10L+"]}
      />

      <Textarea
        label="Requirements"
        value={form.requirements}
        onChange={(e) =>
          setForm({ ...form, requirements: e.target.value })
        }
      />

      <NavButtons back={back} next={next} />
    </motion.div>
  );
}

function Step3({ form, setForm, submit, back, loading }) {
  return (
    <motion.div>
      <label className="block mb-2 font-semibold">
        Upload Plan (Optional)
      </label>
      <input
        type="file"
        className="glass-input"
        onChange={(e) =>
          setForm({ ...form, file: e.target.files[0] })
        }
      />

      <div className="flex justify-between mt-6">
        <BackButton onClick={back} />
        <SubmitButton onClick={submit} loading={loading} />
      </div>
    </motion.div>
  );
}

/* ---------------- SUCCESS ---------------- */
function SuccessScreen() {
  return (
    <div className="text-center text-black dark:text-white">
      <CheckCircle2 size={50} className="mx-auto text-green-400" />
      <p className="mt-4 text-lg">Estimate submitted 🎉</p>
      <p className="text-sm text-gray-400">
        Our team will contact you shortly
      </p>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */
const Input = ({ label, ...props }) => (
  <>
    <label className="block mb-2 font-semibold">{label}</label>
    <input {...props} className="glass-input mb-6" />
  </>
);

const Select = ({ label, value, onChange, options }) => (
  <>
    <label className="block mb-2 font-semibold">{label}</label>
    <select value={value} onChange={onChange} className="glass-input mb-6">
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </>
);

const Textarea = ({ label, ...props }) => (
  <>
    <label className="block mb-2 font-semibold">{label}</label>
    <textarea rows={3} {...props} className="glass-input mb-6" />
  </>
);

const NextButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="cta-btn w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-black"
  >
    Next →
  </button>
);

const NavButtons = ({ back, next }) => (
  <div className="flex justify-between">
    <BackButton onClick={back} />
    <NextButton onClick={next} />
  </div>
);

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="cta-btn bg-gray-400 dark:bg-gray-700 text-white"
  >
    ← Back
  </button>
);

const SubmitButton = ({ onClick, loading }) => (
  <button
    disabled={loading}
    onClick={onClick}
    className="cta-btn bg-green-500 hover:bg-green-600 text-white flex gap-2 disabled:opacity-50"
  >
    <CheckCircle2 size={18} /> {loading ? "Submitting..." : "Submit"}
  </button>
);

/* ---------------- BUBBLES ---------------- */
function AnimatedBubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-orange-400/15 blur-[50px]"
          animate={{ y: [-60, 100, -60] }}
          transition={{ duration: 12 + i, repeat: Infinity }}
          style={{
            width: 80 + i * 5,
            height: 80 + i * 5,
            left: `${(i * 12) % 100}%`,
            top: `${(i * 13) % 90}%`,
          }}
        />
      ))}
    </div>
  );
}
