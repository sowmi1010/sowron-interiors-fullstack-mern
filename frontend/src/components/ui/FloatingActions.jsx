import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50 md:bottom-10 md:right-10">
      {/* WhatsApp Button */}
      <motion.a
        whileTap={{ scale: 0.9 }}
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex items-center gap-2 px-4 py-3 rounded-full font-medium text-sm
          backdrop-blur-xl shadow-lg
          bg-white/60 text-green-600 border border-white/40
          dark:bg-black/50 dark:text-green-400 dark:border-white/10
          hover:shadow-green-500/40 hover:bg-white/80 dark:hover:bg-black/60
          transition
        "
      >
        <MessageCircle size={18} /> WhatsApp
      </motion.a>

      {/* Call Button */}
      <motion.a
        whileTap={{ scale: 0.9 }}
        href="tel:+919876543210"
        className="
          flex items-center gap-2 px-4 py-3 rounded-full font-medium text-sm
          backdrop-blur-xl shadow-lg
          bg-white/60 text-orange-600 border border-white/40
          dark:bg-black/50 dark:text-orange-400 dark:border-white/10
          hover:shadow-orange-500/40 hover:bg-white/80 dark:hover:bg-black/60
          transition
        "
      >
        <Phone size={18} /> Call Now
      </motion.a>
    </div>
  );
}
