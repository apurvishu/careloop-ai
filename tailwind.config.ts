import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f5fa",
          100: "#e2ecf5",
          500: "#2563eb",
          800: "#11223f",
          900: "#0b192c",
          950: "#060d17",
        },
        care: {
          teal: "#0d9488",
          tealLight: "#ccfbf1",
          blue: "#3b82f6",
          blueLight: "#eff6ff",
          amber: "#f59e0b",
          amberLight: "#fef3c7",
          red: "#ef4444",
          redLight: "#fee2e2",
          emerald: "#10b981",
          emeraldLight: "#d1fae5",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
