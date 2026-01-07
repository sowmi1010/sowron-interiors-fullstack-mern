import { useEffect, useState } from "react";
import OtpLogin from "../components/ui/OtpLogin";
import BookingForm from "../components/forms/BookingForm";
import { motion, AnimatePresence } from "framer-motion";

export default function BookDemo() {
  const [logged, setLogged] = useState(
    !!localStorage.getItem("userToken")
  );

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      setLogged(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f6f6f6] dark:bg-[#040404] overflow-hidden">
      <AnimatedBubbles />

      {/* HERO */}
      <section className="relative h-[380px] md:h-[460px] overflow-hidden rounded-b-[60px] shadow-xl">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/v2.mp4"
        />
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute bottom-36 px-6 text-center w-full"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white">
            Book Your Free Interior{" "}
            <span className="text-orange-400">Design Consultation</span>
          </h1>
          <p className="mt-4 text-gray-300">
            3D visualization • Modular concepts • Space planning — FREE
          </p>
        </motion.div>
      </section>

      {/* CONTENT */}
      <div className="px-6 md:px-20 py-20 flex flex-col md:flex-row gap-14 max-w-7xl mx-auto">
        {/* LEFT */}
        <div className="max-w-xl text-gray-900 dark:text-gray-100">
          <h2 className="text-4xl font-extrabold">Plan Your Dream Home ✨</h2>
          <ul className="mt-6 space-y-3 text-gray-600 dark:text-gray-400">
            <li>📐 Virtual 3D Layout Concepts</li>
            <li>🏠 Modular Wardrobe + Kitchen Guidance</li>
            <li>🕒 20-minute Discovery Consultation</li>
            <li>🎨 Material Samples + Budget Estimate</li>
            <li>✔ Fully Free</li>
          </ul>
        </div>

        {/* RIGHT CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={logged ? "form" : "otp"}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md rounded-3xl p-10 backdrop-blur-xl
              bg-white/70 dark:bg-[#0d0d0d]/70 border border-white/30"
          >
            {!logged ? (
              <OtpLogin onSuccess={() => setLogged(true)} />
            ) : (
              <BookingForm />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* BUBBLES */
function AnimatedBubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-orange-400/20 blur-[60px]"
          animate={{ y: [-80, 120, -80] }}
          transition={{ duration: 12 + i, repeat: Infinity }}
          style={{
            width: 120,
            height: 120,
            left: `${i * 10}%`,
            top: `${i * 8}%`,
          }}
        />
      ))}
    </div>
  );
}
