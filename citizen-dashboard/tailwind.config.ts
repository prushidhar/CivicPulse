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
        primary: "#1d4ed8",
        secondary: "#9333ea",
        success: "#16a34a",
        warning: "#eab308",
        danger: "#dc2626",
      },
    },
  },
  plugins: [],
};
export default config;
