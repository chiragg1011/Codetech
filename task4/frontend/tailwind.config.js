/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slateDark: {
          bg: "#07090e",
          card: "rgba(13, 17, 28, 0.7)",
          border: "rgba(255, 255, 255, 0.08)",
          muted: "#94a3b8"
        },
        focusFlow: {
          indigo: "#6366f1",
          purple: "#a855f7",
          productive: "#10b981",
          unproductive: "#ef4444"
        }
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      }
    },
  },
  plugins: [],
}
