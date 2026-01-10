import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Wallet, FileUp, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import SEO from "../components/SEO";

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

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!token) navigate("/login");
    window.scrollTo(0, 0);
  }, [token, navigate]);

  const next = () => {
    if (step === 1 && (!form.city || !form.homeType)) return;
    if (step === 2 && !form.budget) return;
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  /* ================= SUBMIT ================= */
  const submit = async () => {
    try {
      setLoading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });

      await api.post("/estimate/send", fd);
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= SEO ================= */}
      <SEO
        title="Get Interior Cost Estimate | Sowron Interiors"
        description="Get a detailed interior design cost estimate from Sowron Interiors. Personalized pricing for modular kitchens, wardrobes and home interiors."
        keywords="interior estimate, home interior cost, modular kitchen price, Sowron Interiors"
      />

      <section className="min-h-screen bg-white dark:bg-[#0a0a0a]
                          text-gray-900 dark:text-gray-100 py-28 px-6">
        <div className="max-w-3xl mx-auto">

          {/* ================= HEADER ================= */}
          <div className="text-center mb-14">
            <h1 className="text-4xl font-extrabold">
              Get a Detailed Interior Estimate
            </h1>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Answer a few questions and our design experts will prepare a
              personalized cost estimate for your home.
            </p>

            <span className="block mx-auto mt-6 w-20 h-[3px]
                             bg-gradient-to-r from-red-600 to-yellow-400
                             rounded-full" />
          </div>

          {/* ================= CARD ================= */}
          <div className="rounded-3xl p-10
                          bg-gray-50 dark:bg-[#121212]
                          border border-gray-200 dark:border-white/10
                          shadow-xl">

            {submitted ? (
              <SuccessScreen />
            ) : (
              <>
                <Stepper step={step} />
                <p className="text-center text-xs text-gray-500 mb-10">
                  Step {step} of 3
                </p>

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
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= STEPPER ================= */
function Stepper({ step }) {
  const steps = [
    { icon: Home, label: "Home" },
    { icon: Wallet, label: "Budget" },
    { icon: FileUp, label: "Upload" },
  ];

  return (
    <div className="flex justify-between mb-8">
      {steps.map(({ icon: Icon, label }, i) => (
        <div key={i} className="flex-1 text-center">
          <div
            className={`mx-auto w-11 h-11 flex items-center justify-center
              rounded-full mb-2
              ${
                step >= i + 1
                  ? "bg-red-600 text-white"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-600"
              }`}
          >
            <Icon size={18} />
          </div>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= STEP 1 ================= */
function Step1({ form, setForm, next }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Input
        label="City"
        placeholder="Eg: Chennai"
        helper="This helps us assign a local design expert"
        value={form.city}
        onChange={(e) =>
          setForm({ ...form, city: e.target.value })
        }
      />

      <Select
        label="Home Type"
        helper="Select the type of home you want to design"
        value={form.homeType}
        onChange={(e) =>
          setForm({ ...form, homeType: e.target.value })
        }
        options={["1 BHK", "2 BHK", "3 BHK", "Villa"]}
      />

      <NextButton onClick={next} />
    </motion.div>
  );
}

/* ================= STEP 2 ================= */
function Step2({ form, setForm, back, next }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Select
        label="Estimated Budget"
        helper="Approximate budget is enough — final cost is discussed later"
        value={form.budget}
        onChange={(e) =>
          setForm({ ...form, budget: e.target.value })
        }
        options={["₹1.5–3L", "₹3–6L", "₹6–10L", "₹10L+"]}
      />

      <Textarea
        label="Requirements (Optional)"
        placeholder="Eg: Modular kitchen, wardrobe, TV unit…"
        helper="Optional — helps us prepare a more accurate estimate"
        value={form.requirements}
        onChange={(e) =>
          setForm({ ...form, requirements: e.target.value })
        }
      />

      <NavButtons back={back} next={next} />
    </motion.div>
  );
}

/* ================= STEP 3 ================= */
function Step3({ form, setForm, submit, back, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <label className="text-sm text-gray-600 dark:text-gray-400">
        Upload Floor Plan (Optional)
      </label>

      <div>
        <input
          type="file"
          onChange={(e) =>
            setForm({ ...form, file: e.target.files[0] })
          }
          className="w-full px-4 py-3 rounded-xl
                     bg-white dark:bg-[#1a1a1a]
                     border border-dashed border-gray-300
                     dark:border-white/20 text-sm cursor-pointer"
        />
        <p className="mt-1 text-xs text-gray-400">
          JPG, PNG or PDF • Max 5MB
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <BackButton onClick={back} />
        <SubmitButton onClick={submit} loading={loading} />
      </div>
    </motion.div>
  );
}

/* ================= SUCCESS ================= */
function SuccessScreen() {
  return (
    <div className="text-center py-16">
      <CheckCircle2 size={48} className="mx-auto text-green-500" />
      <h3 className="mt-6 text-2xl font-bold">
        Estimate Submitted Successfully
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Our design team will contact you shortly.
      </p>
    </div>
  );
}

/* ================= UI HELPERS ================= */
const Input = ({ label, helper, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600 dark:text-gray-400">
      {label}
    </label>
    <motion.input
      {...props}
      whileFocus={{ scale: 1.01 }}
      className="w-full px-4 py-3 rounded-xl
                 bg-white dark:bg-[#1a1a1a]
                 border border-gray-300 dark:border-white/10
                 outline-none text-sm
                 focus:border-red-500 transition"
    />
    {helper && (
      <p className="text-xs text-gray-400">{helper}</p>
    )}
  </div>
);

const Select = ({ label, helper, value, onChange, options }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600 dark:text-gray-400">
      {label}
    </label>
    <motion.select
      value={value}
      onChange={onChange}
      whileFocus={{ scale: 1.01 }}
      className="w-full px-4 py-3 rounded-xl
                 bg-white dark:bg-[#1a1a1a]
                 border border-gray-300 dark:border-white/10
                 outline-none text-sm
                 focus:border-red-500 transition"
    >
      <option value="">Select an option</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </motion.select>
    {helper && (
      <p className="text-xs text-gray-400">{helper}</p>
    )}
  </div>
);

const Textarea = ({ label, helper, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600 dark:text-gray-400">
      {label}
    </label>
    <motion.textarea
      {...props}
      rows={3}
      whileFocus={{ scale: 1.01 }}
      className="w-full px-4 py-3 rounded-xl
                 bg-white dark:bg-[#1a1a1a]
                 border border-gray-300 dark:border-white/10
                 outline-none text-sm
                 focus:border-red-500 transition"
    />
    {helper && (
      <p className="text-xs text-gray-400">{helper}</p>
    )}
  </div>
);

const NextButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="w-full mt-6 py-3 rounded-xl
               bg-red-600 hover:bg-red-700
               text-white font-semibold transition"
  >
    Continue →
  </motion.button>
);

const NavButtons = ({ back, next }) => (
  <div className="flex justify-between pt-6">
    <BackButton onClick={back} />
    <NextButton onClick={next} />
  </div>
);

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-3 rounded-xl
               bg-gray-300 dark:bg-gray-700
               text-gray-900 dark:text-white
               font-medium"
  >
    ← Back
  </button>
);

const SubmitButton = ({ onClick, loading }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    disabled={loading}
    className="px-8 py-3 rounded-xl
               bg-red-600 hover:bg-red-700
               text-white font-semibold
               disabled:opacity-50 transition"
  >
    {loading ? "Submitting…" : "Submit Estimate"}
  </motion.button>
);
