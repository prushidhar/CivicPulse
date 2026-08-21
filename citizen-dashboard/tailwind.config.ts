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
        primary: "#202124", // Deep grey from 'Civic'
        secondary: "#4285F4", // Google Blue from 'Pulse'
        background: "#f8f9fa", // Google Light Gray
        surface: "#ffffff",
        success: "#34A853", // Google Green
        warning: "#FBBC04", // Google Yellow
        danger: "#EA4335", // Google Red
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
