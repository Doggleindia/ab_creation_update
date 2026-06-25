/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // AB Creation brand palette (single source of truth for the rebrand)
        brand: {
          black: "#171717",
          cream: "#F5F1EA",
          gold: "#CBAA75",
          copper: "#B87D4C",
          rose: "#C79280",
          stone: "#E8E6E3",
        },
      },
    },
  },
  plugins: [],
};
