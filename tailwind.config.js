/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.tsx", "./components/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        red: "#dc3545",
      },
      zIndex: {
        1000: "1000",
      },
    },

    screens: {
      xxs: "300px",
      xs: "425px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1250px",
      "3xl": "1400px",
    },
  },
  plugins: [],
};
