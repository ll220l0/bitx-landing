import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F8FC",
        fg: "#0E1726",
        muted: "#5E6B7F",
        line: "#D8E1EE",
        electric: "#1570EF",
        card: "#FFFFFF",
        deep: "#0E1726",
        alert: "#C62828",
        lime: "#2E7D32"
      },
      boxShadow: {
        soft: "0 14px 32px rgba(15, 41, 77, 0.08)",
        glow: "0 0 0 1px rgba(21,112,239,0.22), 0 10px 24px rgba(21,112,239,0.16)",
        pulse: "0 0 0 1px rgba(46,125,50,0.25), 0 10px 24px rgba(46,125,50,0.14)"
      }
    }
  },
  plugins: []
} satisfies Config;
