/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          /* Primary */
          red: "#D32F2F",
          redDark: "#8E0000",

          /* Secondary */
          yellow: "#FBC02D",
          yellowSoft: "#FFF3C4",

          /* Light Mode */
          lightBg: "#FFFFFF",
          lightCard: "#F9F9F9",
          lightText: "#1A1A1A",
          lightSubText: "#555555",

          /* Dark Mode */
          darkBg: "#0F0F0F",
          darkCard: "#1A1A1A",
          darkText: "#F5F5F5",
          darkSubText: "#AAAAAA",
        },
      },

      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.15)",
        glow: "0 0 25px rgba(251,192,45,0.45)",
        card: "0 8px 25px rgba(0,0,0,0.08)",
      },

      animation: {
        float: "float 4s ease-in-out infinite",
        fadeUp: "fadeUp .6s ease-out forwards",
        spinSlow: "spin 1.2s linear infinite",
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
