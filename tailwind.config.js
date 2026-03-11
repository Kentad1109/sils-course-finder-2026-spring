/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        waseda: {
          primary: "#7a0019",
          light: "#b23a4a",
        },
      },
    },
  },
  plugins: [],
};

