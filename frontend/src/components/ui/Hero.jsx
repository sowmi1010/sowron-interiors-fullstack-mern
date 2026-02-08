import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const PHRASES = [
  "Modular Kitchens",
  "Wardrobes",
  "TV Units",
  "Office Interiors",
  "Turnkey Projects",
  "Premium Custom Furniture",
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  /* ================= Typing Effect ================= */
  useEffect(() => {
    let current = 0;
    let timeout;

    const type = () => {
      if (current <= PHRASES[index].length) {
        setDisplayText(PHRASES[index].slice(0, current));
        current++;
        timeout = setTimeout(type, 60);
      } else {
        timeout = setTimeout(erase, 1400);
      }
    };

    const erase = () => {
      if (current >= 0) {
        setDisplayText(PHRASES[index].slice(0, current));
        current--;
        timeout = setTimeout(erase, 40);
      } else {
        setIndex((prev) => (prev + 1) % PHRASES.length);
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, [index]);

  /* ================= Mouse Parallax ================= */
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const parallaxX = useSpring(useTransform(x, [-500, 500], [-60, 60]), {
    stiffness: 30,
    damping: 20,
  });
  const parallaxY = useSpring(useTransform(y, [-500, 500], [-60, 60]), {
    stiffness: 30,
    damping: 20,
  });

  return (
    <section
      ref={ref}
      onMouseMove={handleMove}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-white dark:bg-black"
    >
      {/* ================= BACKGROUND VIDEO ================= */}
      <motion.video
        src="/v3.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-40"
      />

      {/* ================= DARK OVERLAY ================= */}
      <div className="absolute inset-0 bg-black/55" />

      {/* ================= SOFT GLOW ================= */}
      <motion.div
        animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] rounded-full bg-brand-yellow/20 blur-[200px]"
      />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-6 text-white">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block md:mt-0 mt-24  mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur text-sm tracking-wide"
        >
          Premium Interior Design & Turnkey Solutions
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-6xl xl:text-7xl font-extrabold leading-tight"
        >
          Transform Your Space <br />
          <span className="text-brand-yellow">
            Into Something Extraordinary
          </span>
        </motion.h1>

        {/* Typing */}
        <p className="mt-6 text-xl md:text-2xl font-semibold text-brand-yellow">
          We Build —{" "}
          <span className="border-r-2 border-brand-yellow px-1 animate-pulse">
            {displayText}
          </span>
        </p>

        {/* Subtext */}
        <p className="mt-6 max-w-3xl mx-auto text-gray-200 text-base md:text-lg">
          Luxury modular kitchens, wardrobes, commercial interiors and
          factory-made custom furniture — executed with precision across Chennai.
        </p>

        {/* CTA */}
        <div className="mt-12 mb-10 md:mb-0 flex flex-col sm:flex-row justify-center gap-5">
          <Link
            to="/book-demo"
            className="px-10 py-4 rounded-2xl bg-brand-red text-white font-semibold text-lg shadow-xl hover:scale-105 transition-all"
          >
            Book Free Consultation →
          </Link>

          <Link
            to="/portfolio"
            className="px-10 py-4 rounded-2xl border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black transition-all font-semibold text-lg"
          >
            View Portfolio
          </Link>
        </div>
      </div>

    

      {/* ================= SCROLL INDICATOR ================= */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white opacity-70"
      >
        <ChevronDown size={36} />
      </motion.div>
    </section>
  );
}
