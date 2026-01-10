import { Phone, Mail, Facebook, Instagram, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Website Footer"
      className="relative w-full overflow-hidden text-gray-900 dark:text-gray-200"
    >
      {/* ================= BACKGROUND GRADIENT ================= */}
      <motion.div
        className="
          absolute inset-0
          bg-gradient-to-b
          from-red-200/20 via-yellow-100/10 to-transparent
          dark:from-red-600/10 dark:via-black/50 dark:to-black
        "
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* ================= FLOATING GLOWS ================= */}
      <motion.div
        className="absolute -top-20 left-10 w-72 h-72 bg-red-600/30 blur-[140px] rounded-full pointer-events-none"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-0 right-10 w-80 h-80 bg-yellow-400/25 blur-[160px] rounded-full pointer-events-none"
        animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
        transition={{ duration: 16, repeat: Infinity }}
      />

      {/* ================= CONTENT ================= */}
      <div
        className="
          relative backdrop-blur-xl px-6 py-20
          border-t border-red-200/40 dark:border-white/10
          bg-white/50 dark:bg-black/50
          shadow-inner
        "
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">

          {/* ================= BRAND ================= */}
          <div>
            <img
              src="/logo.png"
              className="w-44 mb-4 drop-shadow-xl"
              alt="Sowron Infrastructure and Solutions Pvt Ltd Logo"
              loading="lazy"
            />

            <h2 className="text-lg font-bold tracking-wide">
              SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD.
            </h2>

            <p className="text-sm opacity-80 mt-3 leading-6">
              Premium turnkey interior & infrastructure solutions in Chennai.
              Modular kitchens, home interiors, office interiors and factory-made
              furniture with expert project execution.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-4 items-center mt-6">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sowron Facebook"
              >
                <Facebook className="text-red-600 hover:text-yellow-400 cursor-pointer transition-transform hover:scale-110" />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sowron Instagram"
              >
                <Instagram className="text-red-600 hover:text-yellow-400 cursor-pointer transition-transform hover:scale-110" />
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
            <h3 className="font-semibold text-red-600 mb-4 text-lg flex items-center gap-2">
              <MapPin size={18} /> Corporate Office
            </h3>

            <p className="text-sm opacity-80 leading-6">
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
            <h3 className="font-semibold text-red-600 mb-4 text-lg flex items-center gap-2">
              <MapPin size={18} /> Factory Unit
            </h3>

            <p className="text-sm opacity-80 leading-6">
              Plot No.246, 260 & 24A, 5th Cross Street,<br />
              200 Feet Radial Rd, English Electric Nagar,<br />
              Old Pallavaram,<br />
              Chennai – 600044
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <p className="flex items-center gap-3 font-medium">
                <Phone size={16} className="text-yellow-500" />
                <a href="tel:+919043177470" className="hover:underline">
                  +91 90431 77470
                </a>
              </p>

              <p className="flex items-center gap-3 opacity-90">
                <Mail size={16} className="text-yellow-500" />
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
      <div className="bg-black text-white text-xs md:text-sm py-4 text-center tracking-wide">
        © {new Date().getFullYear()} SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD.
        <span className="opacity-60"> — All Rights Reserved</span>
      </div>
    </footer>
  );
}
