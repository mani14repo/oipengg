/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"IBM Plex Sans Condensed"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        navy: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bafd",
          400: "#8192fa",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#1e1b4b",
          950: "#0f172a",
        },
        puma: {
          blue: "#2563eb",
          teal: "#0d9488",
          purple: "#7c3aed",
          amber: "#d97706",
          red: "#dc2626",
          green: "#16a34a",
          gray: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};
