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
        // Neumorphic theme colors
        neu: {
          bg: "#f0ede8",
          shadow: "#d4c8bb",
          light: "#ffffff",
        },
        // Accent colors - orange-red
        accent: {
          primary: "#e8441a",
          secondary: "#d63b14",
          slate: "#6b6b6b",
          orange: "#e8441a",
          red: "#ef4444",
          yellow: "#eab308",
          green: "#22c55e",
        },
        // Legacy colors - kept for compatibility
        navy: {
          950: "#f0ede8",
          900: "#f0ede8",
          800: "#e8e4df",
          700: "#d4c8bb",
        },
        electric: {
          500: "#e8441a",
          600: "#d63b14",
        },
      },
      fontFamily: {
        mono: ["var(--font-space-mono)", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        syne: ["var(--font-syne)", "sans-serif"],
      },
      borderWidth: {
        '3': '3px',
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(232, 68, 26, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(232, 68, 26, 0.6)" },
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
        "gradient-border": "linear-gradient(90deg, #e8441a, #d63b14, #e8441a)",
      },
    },
  },
  plugins: [],
};
export default config;
