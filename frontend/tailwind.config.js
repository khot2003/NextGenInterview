/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: false,
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensures Tailwind scans all files for classes
  theme: {
    extend: {},
  },
  plugins: [],
};