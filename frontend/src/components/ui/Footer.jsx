// src/components/Footer.jsx
import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative w-full text-gray-900 dark:text-gray-200  overflow-hidden">
      {/* 🔥 Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-orange-200/20 via-orange-100/10 to-transparent
          dark:from-orange-500/5 dark:via-black/40 dark:to-black
        "
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Floating Glow Circles */}
      <motion.div
        className="absolute -top-10 left-10 w-52 h-52 bg-orange-400/30 blur-[100px] rounded-full pointer-events-none"
        animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-10 w-64 h-64 bg-yellow-300/20 blur-[120px] rounded-full pointer-events-none"
        animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* CONTENT WRAPPER */}
      <div
        className="
          relative backdrop-blur-xl px-6 py-16 
          border-t border-white/40 dark:border-white/10
          bg-white/40 dark:bg-black/40 shadow-inner
        "
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {/* 🏢 Logo + Company Summary */}
          <div>
            <img src="/logo.png" className="w-44 mb-4 drop-shadow-lg" alt="Sowron Logo" />
            <h2 className="text-lg font-bold tracking-wide">SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD.</h2>
            <p className="text-sm opacity-75 mt-2 leading-6">
              Delivering premium interior & infrastructure solutions across Chennai —
              precision, trust, and quality that lasts for years.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 items-center mt-5 text-orange-500">
              <Facebook className="cursor-pointer hover:scale-110 transition" />
              <Instagram className="cursor-pointer hover:scale-110 transition" />
            </div>
          </div>

          {/* 📍 Corporate Address */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-orange-500 mb-3 text-lg">
              Corporate Address
            </h3>
            <p className="text-sm opacity-80 leading-6">
              SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD.<br />
              Old No.16, New No.23,<br />
              Chinna Theru B, Zamin Royapet, Chrompet,<br />
              Chennai – 600044
            </p>
          </motion.div>

          {/* 🏭 Factory */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-orange-500 mb-3 text-lg">
              Factory Address
            </h3>
            <p className="text-sm opacity-80 leading-6">
              Plot No.246, 260 & 24A, 5th Cross Street,<br />
              200 Feet Radial Rd, English Electric Nagar,<br />
              Old Pallavaram,<br />
              Chennai – 600044
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <Phone size={16} /> +91 90431 77470
              </p>
              <p className="flex items-center gap-2 opacity-90">
                <Mail size={16} /> sowron.info@gmail.com
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* COPYRIGHT STRIP */}
      <div className="bg-black text-white text-xs md:text-sm py-4 text-center">
        © {new Date().getFullYear()} SOWRON INFRASTRUCTURE AND SOLUTIONS PVT. LTD. — All Rights Reserved
      </div>
    </footer>
  );
}
