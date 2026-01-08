import { useEffect, useState } from "react";
import OtpLogin from "../components/ui/OtpLogin";
import BookingForm from "../components/forms/BookingForm";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";

export default function BookDemo() {
  const [logged, setLogged] = useState(
    !!localStorage.getItem("userToken")
  );

  useEffect(() => {
    if (localStorage.getItem("userToken")) {
      setLogged(true);
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Book Free Interior Consultation | Sowron Interiors</title>
        <meta
          name="description"
          content="Book a free interior design consultation with Sowron Interiors. Get expert guidance, 3D concepts, and budget planning."
        />
      </Helmet>

      <section
        className="
          min-h-screen
          bg-white dark:bg-[#0a0a0a]
          text-gray-900 dark:text-gray-100
        "
      >
        {/* ================= HERO ================= */}
        <section className="relative h-[340px] md:h-[420px] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            src="/v2.mp4"
          />
          <div className="absolute inset-0 bg-black/70" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 h-full flex flex-col
                       justify-center items-center text-center px-6"
          >
            <span className="text-yellow-400 text-xs tracking-widest uppercase mb-4">
              Free Consultation
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              Book Your Interior Design Consultation
            </h1>

            <p className="mt-4 max-w-xl text-sm md:text-base text-gray-300">
              Speak directly with our interior expert and get clarity on
              layouts, materials, timelines, and budget — completely free.
            </p>
          </motion.div>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24
                            grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* ================= LEFT ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold">
              What You’ll Get
            </h2>

            <span
              className="
                block mt-4 w-16 h-[3px]
                bg-gradient-to-r from-red-600 to-yellow-400
                rounded-full
              "
            />

            <ul className="mt-10 space-y-5 text-gray-700 dark:text-gray-300 text-sm md:text-base">
              <li>✔ Personalized interior guidance</li>
              <li>✔ Space planning & layout suggestions</li>
              <li>✔ Modular kitchen & wardrobe consultation</li>
              <li>✔ Material & finish recommendations</li>
              <li>✔ Transparent budget estimation</li>
              <li>✔ No obligation • Completely free</li>
            </ul>
          </motion.div>

          {/* ================= RIGHT ================= */}
          <AnimatePresence mode="wait">
            <motion.div
              key={logged ? "form" : "otp"}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="
                w-full max-w-md mx-auto
                rounded-3xl p-8
                bg-gray-50 dark:bg-[#121212]
                border border-gray-200 dark:border-white/10
                shadow-xl
              "
            >
              {!logged ? (
                <OtpLogin onSuccess={() => setLogged(true)} />
              ) : (
                <BookingForm />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </section>
    </>
  );
}
