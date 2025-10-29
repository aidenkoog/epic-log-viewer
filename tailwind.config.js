/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f8ff",
          100: "#e6eeff",
          200: "#cddcff",
          300: "#a9c1ff",
          400: "#7a9bff",
          500: "#4c75ff",
          600: "#2a55f0",
          700: "#1f42c2",
          800: "#1c3aa2",
          900: "#1a3386"
        }
      }
    }
  },
  plugins: []
}
