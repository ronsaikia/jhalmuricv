import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: "#020817",
          900: "#0d1b2e",
          800: "#1e3a5f",
          700: "#2d4a6f",
        },
        electric: {
          500: "#3b82f6",
          600: "#2563eb",
        },
        accent: {
          slate: "#94a3b8",
          orange: "#f97316",
          red: "#ef4444",
          yellow: "#eab308",
          green: "#22c55e",
        },
      },
      fontFamily: {
        mono: ["var(--font-space-mono)", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-slight": "bounce-slight 1s ease-in-out infinite",
        "dash": "dash 2s ease-in-out infinite",
        "fire": "fire 1s ease-in-out infinite alternate",
        "spark": "spark 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(37, 99, 235, 0.6)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bounce-slight": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        dash: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
        fire: {
          "0%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1.1) rotate(5deg)", opacity: "0.9" },
        },
        spark: {
          "0%": { transform: "translate(0, 0) scale(1)", opacity: "1" },
          "100%": { transform: "translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0)", opacity: "0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-border": "linear-gradient(90deg, #2563eb, #3b82f6, #2563eb)",
      },
    },
  },
  plugins: [],
};
export default config;
