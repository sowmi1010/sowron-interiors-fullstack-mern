// src/pages/Home.jsx
import Hero from "../components/ui/Hero";
import { Link } from "react-router-dom";
import FeedbackSection from "../components/forms/FeedbackSection";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative w-full bg-white dark:bg-[#050505] text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* GLOBAL BACKGROUND FX */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Floating glowing balls */}
        <motion.div
          animate={{ y: [-80, 80, -80], x: [-40, 40, -40] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-20 w-80 h-80 rounded-full bg-orange-400/15 dark:bg-orange-500/10 blur-[150px]"
        />
        <motion.div
          animate={{ y: [60, -60, 60], x: [60, 120, 60] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute right-0 bottom-40 w-96 h-96 rounded-full bg-yellow-300/10 dark:bg-orange-400/10 blur-[170px]"
        />
        {/* Particle noise texture */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('/noise.png')] mix-blend-soft-light"></div>
      </div>

      {/* ================= HERO ================= */}
      <Hero />

      {/* ================= WHAT WE DO ================= */}
      <motion.section
        initial={{ opacity: 0, y: 90 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1 }}
        className="relative px-6 py-32 max-w-7xl mx-auto z-10"
      >
        {/* Glow divider */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div>

        <h2 className="text-4xl font-extrabold text-center mb-16">
          WHAT WE DO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* List */}
          <ul className="space-y-4 text-lg leading-8 relative">
            {[
              "Modular Furniture & Fit-outs",
              "Turnkey Interior Execution",
              "Design & Build Contracting",
              "Complete Project Management",
              "Factory Made Panel Furniture",
              "Quality Control & Fast Delivery",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 10, scale: 1.06 }}
                className="
                  flex items-center gap-3
                  p-3 rounded-lg cursor-default
                  group transition-all duration-200
                  hover:bg-orange-100/70 dark:hover:bg-white/5
                "
              >
                <span className="text-orange-500 font-bold text-xl group-hover:scale-125 transition">
                  •
                </span>
                {item}
              </motion.li>
            ))}
          </ul>

          {/* Image Parallax With Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <motion.img
              src="/i8.jpg"
              className="object-cover rounded-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60"></div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================= ABOUT ================= */}
      {/* ================== ABOUT ================== */}
      <motion.section
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative px-6 py-32 bg-gradient-to-b from-transparent to-orange-50/20 dark:to-[#0a0a0a]"
      >
        {/* subtle background orb */}
        <motion.div
          animate={{ y: [0, 60, 0], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-10 right-16 w-96 h-96 bg-orange-500/20 dark:bg-orange-500/10 blur-[180px] rounded-full pointer-events-none"
        />

        <h2 className="text-4xl font-extrabold text-center mb-20">
          ABOUT SOWRON
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center max-w-6xl mx-auto">
          {/* LEFT — TEXT STORY */}
          <div className="space-y-8 relative z-10">
            <p className="text-lg leading-8 opacity-85">
              Sowron is a modern turnkey interior execution & furniture
              manufacturing company — delivering{" "}
              <span className="text-orange-600 font-semibold dark:text-orange-400">
                precision-crafted interiors
              </span>
              backed by factory-made production, project management expertise &
              transparent delivery.
            </p>

            {/* signature quote badge */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="
          border-l-4 border-orange-500 pl-6 py-3
          text-xl italic font-light leading-relaxed
          text-gray-700 dark:text-gray-200
        "
            >
              “We believe good design is silent — powerful, timeless,
              experienced through detail.”
            </motion.div>

            {/* Founders – optional */}
            <div className="mt-6 flex items-center gap-4">
              <img
                src="i8.jpg"
                alt="Founder"
                className="w-14 h-14 rounded-full object-cover shadow-md"
              />
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                  — Founder & Director
                </h4>
                <p className="text-sm opacity-60">
                  Sowron Infrastructure & Solutions Pvt. Ltd.
                </p>
              </div>
            </div>

            {/* Factory Stats */}
            <div className="grid grid-cols-3 gap-4 text-center pt-6">
              {[
                ["50,000+ sq.ft", "Production Capacity"],
                ["8+ Years", "Execution Experience"],
                ["3 Units", "Manufacturing Facilities"],
              ].map(([num, label], i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-lg 
                       border border-orange-200/40 dark:border-white/10
                       py-4 shadow-sm"
                >
                  <h3 className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                    {num}
                  </h3>
                  <p className="text-xs opacity-70">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT — CINEMATIC IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.04 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src="/i11.jpg"
              className="object-cover h-[450px] w-full rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60 opacity-40"></div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================= FEEDBACK ================= */}
      <FeedbackSection />

      {/* ================= CTA ================= */}
      {/* ================= CTA SECTION ================= */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative py-36 text-center overflow-hidden"
      >
        {/* 🔥 Background Video / Image (auto fallback) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-30"
        >
          <source src="/v3.mp4" type="video/mp4" />
        </video>
        <img
          src="/i11.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-30"
          alt=""
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 dark:from-black/80"></div>

        {/* Floating glowing orb */}
        <motion.div
          animate={{ y: [0, -60, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px]
               bg-orange-500/40 blur-[200px] rounded-full pointer-events-none"
        />

        {/* CTA Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-white px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight"
          >
            Make Your Dream Home a Reality ✨
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-lg opacity-90 mb-12"
          >
            Talk to our expert design team — Free 3D Layout • Wood-Selection •
            Cost Planning
          </motion.p>

          {/* 🎯 Animated Luxury Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/book-demo"
              className="
        group inline-flex items-center gap-3 px-10 py-4
        rounded-2xl text-lg font-semibold bg-white text-orange-600
        shadow-xl hover:shadow-orange-500/40 hover:bg-orange-50
        transition-all duration-300 backdrop-blur-md relative overflow-hidden
      "
            >
              <span className="relative z-10">Book Free Consultation</span>

              {/* arrow animate */}
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 6 }}
                className="relative z-10"
              >
                →
              </motion.span>

              {/* glowing slide highlight inside button */}
              <span
                className="absolute inset-0 bg-gradient-to-r from-orange-300/60 to-transparent
          translate-x-[-100%] group-hover:translate-x-[100%]
          transition-all duration-700"
              ></span>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
