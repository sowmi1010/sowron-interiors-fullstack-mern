import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Hero() {
  const phrases = [
    "Modular Kitchens",
    "Wardrobes",
    "TV Units",
    "Office Interiors",
    "Turnkey Projects",
    "Premium Custom Furniture",
  ];

  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  /* ================= Typing Effect ================= */
  useEffect(() => {
    let current = 0;
    let timeout;

    const type = () => {
      if (current <= phrases[index].length) {
        setDisplayText(phrases[index].slice(0, current));
        current++;
        timeout = setTimeout(type, 60);
      } else {
        timeout = setTimeout(erase, 1200);
      }
    };

    const erase = () => {
      if (current >= 0) {
        setDisplayText(phrases[index].slice(0, current));
        current--;
        timeout = setTimeout(erase, 40);
      } else {
        setIndex((prev) => (prev + 1) % phrases.length);
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, [index]);

  /* ================= Mouse Glow ================= */
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const glowX = useSpring(useTransform(x, [-600, 600], [-160, 160]), {
    stiffness: 45,
    damping: 18,
  });
  const glowY = useSpring(useTransform(y, [-600, 600], [-160, 160]), {
    stiffness: 45,
    damping: 18,
  });

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      className="
        relative h-screen w-full overflow-hidden
        flex items-center justify-center
        bg-gradient-to-b from-white via-white to-yellow-50/40
        dark:from-black dark:via-[#0b0b0b] dark:to-black
        text-gray-900 dark:text-gray-100
      "
    >
      {/* ================= BACKGROUND VIDEO ================= */}
      <video
        src="/v3.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-45"
      />

      {/* ================= OVERLAY ================= */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/70" />

      {/* ================= NOISE ================= */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] bg-[url('/noise.png')] mix-blend-overlay" />

      {/* ================= RED PRIMARY MOUSE GLOW ================= */}
      <motion.div
        style={{ translateX: glowX, translateY: glowY }}
        className="
          absolute w-[380px] h-[380px] rounded-full
          bg-red-600/35 blur-[170px]
          pointer-events-none
        "
      />

      {/* ================= YELLOW SECONDARY ORB ================= */}
      <motion.div
        animate={{ y: [0, -50, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="
          absolute w-[700px] h-[700px] rounded-full
          bg-yellow-400/25 blur-[240px]
        "
      />

      {/* ================= CONTENT ================= */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1 }}
        className="relative z-10 max-w-5xl mx-auto text-center px-6"
      >
        {/* ================= BADGE ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="
            inline-block mb-6 px-5 py-2 rounded-full
            bg-red-100/80 dark:bg-red-500/10
            text-red-600 dark:text-red-400
            font-semibold text-sm tracking-wide
          "
        >
          Premium Interior Design & Turnkey Solutions
        </motion.div>

        {/* ================= HEADLINE ================= */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="
            text-4xl md:text-6xl xl:text-7xl
            font-extrabold leading-tight
          "
        >
          Transform Your Space <br />
          <span className="
            bg-gradient-to-r
            from-red-600 via-red-500 to-yellow-400
            bg-clip-text text-transparent
          ">
            Into Something Extraordinary
          </span>
        </motion.h1>

        {/* ================= TYPING ================= */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="
            mt-6 text-xl md:text-2xl font-semibold
            text-red-600 dark:text-red-400
          "
        >
          We Build —{" "}
          <span className="border-r-2 border-yellow-400 px-1 animate-pulse">
            {displayText}
          </span>
        </motion.p>

        {/* ================= SUBTEXT ================= */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="
            mt-5 max-w-3xl mx-auto
            text-gray-700 dark:text-gray-300
            text-base md:text-lg
          "
        >
          Luxury modular kitchens, wardrobes, commercial interiors and
          factory-made custom furniture — executed with precision across Chennai.
        </motion.p>

        {/* ================= CTA ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex flex-col sm:flex-row justify-center gap-5"
        >
          {/* PRIMARY CTA */}
          <Link
            to="/book-demo"
            className="
              magnetic px-10 py-4 rounded-2xl
              bg-gradient-to-r from-red-600 to-red-700
              text-white font-semibold text-lg
              shadow-xl hover:shadow-red-600/40
              transition-all
            "
          >
            Book Free Consultation →
          </Link>

          {/* SECONDARY CTA */}
          <Link
            to="/portfolio"
            className="
              magnetic px-10 py-4 rounded-2xl
              border-2 border-yellow-400
              text-yellow-600 dark:text-yellow-400
              hover:bg-yellow-400 hover:text-black
              transition-all font-semibold text-lg
            "
          >
            View Portfolio
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
