import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       "var(--bg)",
        surface:  "var(--surface)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        bd:       "var(--bd)",
        "bd-bright": "var(--bd-bright)",
        primary: {
          DEFAULT: "var(--primary)",
          hover:   "var(--primary-hover)",
          muted:   "var(--primary-muted)",
        },
        accent:  "var(--accent)",
        accent2: "var(--accent2)",
        muted:   "var(--muted)",
        muted2:  "var(--muted2)",
        success: "var(--success)",
        error:   "var(--error)",
        warning: "var(--warning)",
        running: "var(--running)",
        /* Legacy dark scale — keep for existing LogViewer/FileExplorer */
        dark: {
          600: "#475569",
          700: "#1E1E30",
          750: "#16161F",
          800: "#13131C",
          900: "#0E0E15",
          950: "#08080C",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card:       "0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.4)",
        "card-md":  "0 4px 16px rgba(0,0,0,0.5)",
        "card-hover": "0 0 0 1px var(--primary-border), 0 4px 24px rgba(0,0,0,0.5)",
        glow:       "0 0 24px var(--primary-glow)",
        "glow-success": "0 0 20px rgba(34,197,94,0.12)",
        "glow-error":   "0 0 20px rgba(239,68,68,0.12)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      animation: {
        "shimmer":       "shimmer 1.4s ease infinite",
        "dot-pulse":     "dot-pulse 1.8s ease-in-out infinite",
        "progress-bar":  "progress-shimmer 1.6s linear infinite",
        "fade-in":       "fadeIn 0.3s ease-out",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
