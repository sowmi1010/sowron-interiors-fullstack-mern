/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#D32F2F",
          redDark: "#8E0000",
          yellow: "#FBC02D",
          yellowSoft: "#FFF3C4",
          darkBg: "#0F0F0F",
        },
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.15)",
        glow: "0 0 25px rgba(251,192,45,0.45)",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        fadeUp: "fadeUp .6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
