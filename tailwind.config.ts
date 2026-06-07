import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Slate-based neutral palette — professional, not flashy
        surface: {
          0: "#ffffff",
          1: "#f8f9fb",
          2: "#f1f3f7",
          3: "#e4e8ef",
        },
        ink: {
          DEFAULT: "#0d1117",
          muted: "#4b5563",
          subtle: "#9ca3af",
        },
        accent: {
          DEFAULT: "#1a56db", // strong blue — engineering credibility
          hover: "#1740a8",
          subtle: "#eff4ff",
        },
        // Quant dashboard palette — teal, kept separate from site accent
        quant: {
          DEFAULT:  "#0d9488", // teal-600 — primary interactive
          hover:    "#0f766e", // teal-700
          subtle:   "#f0fdfa", // teal-50 — card highlights, subtle fills
          muted:    "#99f6e4", // teal-200 — progress bar fills
        },
      },
      maxWidth: {
        content: "720px",
        wide: "1100px",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#0d1117",
            a: { color: "#1a56db", textDecoration: "none" },
            "a:hover": { textDecoration: "underline" },
            "h1,h2,h3,h4": { color: "#0d1117", fontWeight: "600" },
            code: {
              color: "#0d1117",
              backgroundColor: "#f1f3f7",
              borderRadius: "4px",
              padding: "2px 5px",
              fontSize: "0.875em",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
