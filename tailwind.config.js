/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fff8de",
          100: "#f7e7b2",
          200: "#efd07a",
          300: "#e8bf52",
          400: "#ddb840",
          500: "#D4AF37",
          600: "#B8891B",
          700: "#8a6718",
          800: "#634915",
          900: "#46330f",
        },
        brown: {
          50: "#1A142A",
          100: "#2A2042",
          200: "#46376d",
          300: "#C5BBEB",
          400: "#B0A3DD",
          500: "#9C90C7",
          600: "#7B6FA6",
          700: "#5B4F84",
          800: "#09090F",
          900: "#06060A",
        },
        purple: {
          400: "#8B5CF6",
          500: "#7B3FF2",
          700: "#4F2D9B",
        },
      },
    },
  },
  plugins: [],
};
