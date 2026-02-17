/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // enable dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}" // scan all your TSX files
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFFBB1",
        "primary-hover": "#F5F09B",
        secondary: "#A5C89E",
        "secondary-dark": "#8DAE86",
        "text-main": "#3D4135",
        "text-muted": "#7D8C63",
        "background-light": "#FAFAF9",
        "surface-light": "#ffffff",
        "border-light": "#E2E8F0"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')]
}
