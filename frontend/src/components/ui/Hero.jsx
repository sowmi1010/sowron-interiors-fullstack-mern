// src/components/Hero.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useMotionValue, useTransform, useSpring } from "framer-motion";

export default function Hero() {
  const phrases = [
    "Modular Kitchens",
    "Wardrobes",
    "TV Units",
    "Office Interiors",
    "Turnkey Projects",
    "Premium Custom Furniture"
  ];

  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  // 🎹 Typing Animation Logic
  useEffect(() => {
    let current = 0;
    const type = () => {
      if (current <= phrases[index].length) {
        setDisplayText(phrases[index].slice(0, current));
        current++;
        setTimeout(type, 60);
      } else {
        setTimeout(() => erase(), 1200);
      }
    };
    const erase = () => {
      if (current >= 0) {
        setDisplayText(phrases[index].slice(0, current));
        current--;
        setTimeout(erase, 40);
      } else {
        setIndex((prev) => (prev + 1) % phrases.length);
      }
    };
    type();
  }, [index]);

  // 🔥 Mouse Glow
  const ref = useRef();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const move = (e) => {
    const bounds = ref.current.getBoundingClientRect();
    x.set(e.clientX - bounds.left - bounds.width / 2);
    y.set(e.clientY - bounds.top - bounds.height / 2);
  };
  const glowX = useSpring(useTransform(x, [-500, 500], [-120, 120]));
  const glowY = useSpring(useTransform(y, [-500, 500], [-120, 120]));

  return (
    <section
      ref={ref}
      onMouseMove={move}
      className="relative h-[92vh] flex items-center justify-center overflow-hidden 
      bg-white dark:bg-black text-gray-900 dark:text-gray-100"
    >
      {/* 🎞 Background Cinematic Video */}
      <video
        src="/v3.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-[.25] dark:opacity-[.35]"
      />

      {/* ⭐ Noise Layer */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.06] bg-[url('/i7.jpg')] mix-blend-overlay" />

      {/* 🟣 Mouse Glow */}
      <motion.div
        style={{ translateX: glowX, translateY: glowY }}
        className="absolute w-[320px] h-[320px] rounded-full bg-orange-500/25 blur-[140px] pointer-events-none"
      />

      {/* ✨ Floating Bubble */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 25, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-[600px] h-[600px] rounded-full bg-orange-400/20 dark:bg-orange-600/30 blur-[200px]"
      />

      {/* 🏆 HERO CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-20 text-center px-6"
      >
        {/* 🧊 Heading */}
        <motion.h1
          animate={{ opacity: [0, 1], y: [30, 0] }}
          transition={{ duration: 1.2 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight"
        >
          Transform Your Home<br />
          <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 bg-clip-text text-transparent">
            Into Something Extraordinary
          </span>
        </motion.h1>

        {/* 🟠 Typing Changing Words */}
        <motion.p
          animate={{ opacity: [0, 1], y: [20, 0] }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-xl font-semibold text-orange-600 dark:text-orange-400"
        >
          We Build – <span className="border-r-2 border-orange-500 animate-pulse px-1">
            {displayText}
          </span>
        </motion.p>

        {/* 🧾 Sub-Text */}
        <motion.p
          animate={{ opacity: [0, 1], y: [20, 0] }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 dark:text-gray-300 text-lg mt-4 max-w-2xl mx-auto"
        >
          Crafting beautiful, luxury kitchens, wardrobes, commercial interiors & custom spaces across Chennai.
        </motion.p>

        {/* 🎯 Buttons */}
        <motion.div
          animate={{ opacity: [0, 1], y: [30, 0] }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-4 mt-10"
        >
          <Link
            to="/book-demo"
            className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg"
          >
            Book Free Consultation →
          </Link>
          <Link
            to="/portfolio"
            className="px-8 py-3 border border-orange-600 text-orange-600 dark:border-orange-500 dark:text-orange-400
            hover:bg-orange-500 hover:text-white rounded-xl font-semibold transition shadow-lg"
          >
            View Portfolio
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
