import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        soil:  { DEFAULT: "#0F0D08", 800: "#1A1710", 700: "#252015", 600: "#2E2818" },
        gold:  { DEFAULT: "#E8A020", light: "#F5C842", muted: "#C4841A", faint: "rgba(232,160,32,0.1)" },
        cream: { DEFAULT: "#F2EBD9", muted: "rgba(242,235,217,0.6)", faint: "rgba(242,235,217,0.08)" },
        unit:  { high: "#4CAF50", mid: "#FFC107", low: "#FF9800", critical: "#F44336" },
      },
      animation: {
        "fade-up":   "fadeUp 0.55s ease both",
        "fade-in":   "fadeIn 0.4s ease both",
        "fill-bar":  "fillBar 1.2s ease 0.5s both",
        "float":     "float 5s ease-in-out infinite",
        "ticker":    "ticker 28s linear infinite",
        "slide-in":  "slideIn 0.5s ease 2s both",
        "blink":     "blink 1.6s ease-in-out infinite",
        "pulse-slow":"pulse 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:  { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fillBar: { "0%": { width: "0%" }, "100%": { width: "var(--fill-w, 60%)" } },
        float:   { "0%,100%": { transform: "translateY(0) rotate(-1.5deg)" }, "50%": { transform: "translateY(-12px) rotate(-1.5deg)" } },
        ticker:  { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        slideIn: { "from": { opacity: "0", transform: "translateX(16px)" }, "to": { opacity: "1", transform: "translateX(0)" } },
        blink:   { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
      },
      backgroundImage: {
        "dot-grid": "radial-gradient(rgba(242,235,217,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-grid": "44px 44px",
      },
    },
  },
  plugins: [],
};
export default config;
