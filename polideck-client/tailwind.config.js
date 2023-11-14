/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    backgroundColor: {
      'iframe': '#1e1e1e',
    },
    extend: {
      fontFamily: {
        righteous: ["Righteous", "sans-serif"],
        lato: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
