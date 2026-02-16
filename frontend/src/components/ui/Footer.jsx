import { Phone, Mail, Facebook, Instagram, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Website Footer"
      className="relative isolate w-full overflow-hidden text-brand-lightText dark:text-brand-darkText"
    >
      {/* ================= SOFT BACKGROUND ================= */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-brand-yellowSoft/30 via-white to-white dark:from-black dark:via-black dark:to-black" />

      {/* ================= FLOATING LIGHTS ================= */}
      <motion.div
        className="absolute -top-20 left-10 -z-10 w-80 h-80 bg-brand-red/20 blur-[180px] rounded-full pointer-events-none"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-0 right-10 -z-10 w-96 h-96 bg-brand-yellow/20 blur-[200px] rounded-full pointer-events-none"
        animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      {/* ================= CONTENT ================= */}
      <div
        className="
          relative z-10 px-6 py-20
          border-t border-brand-yellow/30 dark:border-white/10
          bg-white/80 dark:bg-black/80 backdrop-blur-xl
        "
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14">

          {/* ================= BRAND ================= */}
          <div>
            <img
              src="/logo.png"
              className="mb-6 drop-shadow-xl"
              alt="Sowron Infrastructure and Solutions Pvt Ltd Logo"
              loading="lazy"
            />

            <h2 className="text-lg font-bold tracking-wide mb-3">
              SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD.
            </h2>

            <p className="text-sm opacity-80 leading-7">
              Premium turnkey interior & infrastructure solutions in Chennai.
              Modular kitchens, home interiors, office interiors and factory-made
              furniture with expert project execution.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-5 items-center mt-8">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sowron Facebook"
                className="p-3 rounded-full bg-white shadow hover:shadow-brand-red/30 transition"
              >
                <Facebook className="text-brand-red" />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sowron Instagram"
                className="p-3 rounded-full bg-white shadow hover:shadow-brand-yellow/40 transition"
              >
                <Instagram className="text-brand-red" />
              </a>
            </div>
          </div>

          {/* ================= CORPORATE ADDRESS ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-semibold text-brand-red mb-5 text-lg flex items-center gap-2">
              <MapPin size={18} /> Corporate Office
            </h3>

            <p className="text-sm opacity-80 leading-7">
              SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD.<br />
              Old No.16, New No.23,<br />
              Chinna Theru B, Zamin Royapet, Chrompet,<br />
              Chennai – 600044
            </p>
          </motion.div>

          {/* ================= FACTORY ADDRESS ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-semibold text-brand-red mb-5 text-lg flex items-center gap-2">
              <MapPin size={18} /> Factory Unit
            </h3>

            <p className="text-sm opacity-80 leading-7">
              Plot No.246, 260 & 24A, 5th Cross Street,<br />
              200 Feet Radial Rd, English Electric Nagar,<br />
              Old Pallavaram,<br />
              Chennai – 600044
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <p className="flex items-center gap-3 font-medium">
                <Phone size={16} className="text-brand-yellow" />
                <a href="tel:+919043177470" className="hover:underline">
                  +91 90431 77470
                </a>
              </p>

              <p className="flex items-center gap-3 opacity-90">
                <Mail size={16} className="text-brand-yellow" />
                <a
                  href="mailto:sowron.info@gmail.com"
                  className="hover:underline"
                >
                  sowron.info@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================= COPYRIGHT ================= */}
      <div
        className="relative z-10 border-t border-black/10 dark:border-white/10
          bg-gradient-to-r from-[#f8f8f8] via-white to-[#f8f8f8]
          dark:from-[#050505] dark:via-black dark:to-[#050505]
          text-brand-lightText dark:text-brand-darkText py-6 px-4 text-center"
      >
        <p className="text-[11px] md:text-sm font-medium tracking-[0.08em] uppercase">
          &copy; {new Date().getFullYear()} SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD.
          <span className="opacity-60"> - All Rights Reserved</span>
        </p>

        <p className="mt-3 text-xs md:text-sm flex flex-wrap items-center justify-center gap-2">
          <span className="opacity-80">Developed by</span>
          <a
            href="https://sowmi1010.github.io/my-portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold bg-gradient-to-r from-brand-red to-brand-yellow
              bg-clip-text text-transparent hover:brightness-110 transition"
          >
            Sowmiya Thangadurai
          </a>
          <span className="opacity-50">|</span>
          <span className="opacity-80">Number</span>
          <a
            href="tel:+917305312767"
            className="px-3 py-1 rounded-full border border-brand-red/30 dark:border-brand-yellow/30
              bg-brand-red/5 dark:bg-brand-yellow/10 font-semibold hover:scale-105 transition"
          >
            7305312767
          </a>
        </p>
      </div>
    </footer>
  );
}



