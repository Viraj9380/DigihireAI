/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",       // Blue-500
        secondary: "#1e293b",     // Slate-800
      },
    },
  },
  plugins: [],
};
