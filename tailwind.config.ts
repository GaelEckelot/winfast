import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#07080c",
          panel: "#0d0f16",
          elevated: "#11141d",
        },
        line: "#1c2030",
        accent: {
          DEFAULT: "#1f63c9",
          soft: "#5b8fe0",
          violet: "#8b46b0",
          lime: "#0f8b58",
          amber: "#c9921f",
          rose: "#c21f3a",
        },
        muted: "#6b7385",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.15), 0 0 24px -6px rgba(34,211,238,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse_ring: {
          "0%": { boxShadow: "0 0 0 0 rgba(34,211,238,0.4)" },
          "100%": { boxShadow: "0 0 0 10px rgba(34,211,238,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-ring": "pulse_ring 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
