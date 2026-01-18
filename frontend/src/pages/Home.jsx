import Hero from "../components/ui/Hero";
import { Link } from "react-router-dom";
import FeedbackSection from "../components/forms/FeedbackSection";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <>
      {/* ================= SEO ================= */}
      <SEO
        title="Sowron Interiors | Premium Interior Design & Turnkey Solutions"
        description="Sowron Interiors delivers premium turnkey interior design, modular furniture, factory-made execution and expert project management."
        keywords="interior design, turnkey interiors, modular furniture, Sowron Interiors"
      />

      {/* ================= PAGE WRAPPER ================= */}
      <div
        className="
          relative w-full overflow-hidden
          bg-gradient-to-b from-white via-white to-brand-yellowSoft/30
          dark:from-[#050505] dark:via-[#0b0b0b] dark:to-black
          text-brand-lightText dark:text-brand-darkText
        "
      >
        {/* ================= BACKGROUND FX ================= */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <motion.div
            animate={{ y: [-60, 60, -60], x: [-30, 30, -30] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-10 top-32 w-72 h-72 rounded-full bg-brand-red/12 blur-[140px]"
          />
          <motion.div
            animate={{ y: [40, -40, 40], x: [80, 140, 80] }}
            transition={{ duration: 16, repeat: Infinity }}
            className="absolute right-0 bottom-40 w-96 h-96 rounded-full bg-brand-yellow/10 blur-[160px]"
          />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-soft-light" />
        </div>

        {/* ================= HERO ================= */}
        <Hero />

        {/* ================= WHAT WE DO ================= */}
        <motion.section
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto z-10"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16">
            WHAT WE DO
            <span className="block mx-auto mt-4 w-24 h-[3px] rounded-full bg-gradient-to-r from-brand-red to-brand-yellow" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <ul className="space-y-4 text-lg leading-8 bg-white/70 dark:bg-white/5  p-8">
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
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-brand-yellowSoft/70 dark:hover:bg-white/10 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-yellow shadow-glow" />
                  {item}
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <motion.img
                src="/i8.jpg"
                alt="Interior execution and modular furniture"
                className="object-cover rounded-2xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60" />
            </motion.div>
          </div>
        </motion.section>

        {/* ================= ABOUT ================= */}
        <motion.section
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative px-6 py-20 md:py-32"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-20">
            ABOUT SOWRON
            <span className="block mx-auto mt-4 w-24 h-[3px] rounded-full bg-gradient-to-r from-brand-red to-brand-yellow" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              <p className="text-lg leading-8 opacity-85">
                Sowron is a modern turnkey interior execution & furniture
                manufacturing company delivering{" "}
                <span className="text-brand-red font-semibold">
                  precision-crafted interiors
                </span>{" "}
                backed by factory production and expert project management.
              </p>

              <div className="border-l-4 border-brand-yellow pl-6 italic text-xl opacity-80">
                “Good design is silent — powerful, timeless, and experienced
                through detail.”
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 text-center">
                {[
                  ["50,000+ sq.ft", "Production Capacity"],
                  ["8+ Years", "Experience"],
                  ["3 Units", "Factories"],
                ].map(([num, label], i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur border border-brand-yellow/30 dark:border-white/10 py-5 shadow-card"
                  >
                    <h3 className="font-bold text-brand-red text-lg">{num}</h3>
                    <p className="text-xs opacity-70">{label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

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
                alt="Luxury interior design project"
                className="object-cover h-[450px] w-full rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50" />
            </motion.div>
          </div>
        </motion.section>

        {/* ================= FEEDBACK ================= */}
        <FeedbackSection />

        {/* ================= CTA ================= */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative py-20 md:py-36 text-center overflow-hidden"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src="/v3.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/70" />

          <div className="relative z-10 max-w-3xl mx-auto text-white px-6">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Make Your Dream Home a Reality ✨
            </h2>

            <p className="text-lg opacity-90 mb-12">
              Free 3D Layout • Wood Selection • Cost Planning
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/book-demo"
                className="magnetic inline-flex items-center gap-3 px-12 py-5 rounded-2xl text-lg font-semibold bg-brand-yellow text-black shadow-glow hover:scale-105 transition-all"
              >
                Book Free Consultation →
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
