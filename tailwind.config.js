/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#15803d', // Green-700 (Lighter than previous deep green)
        secondary: '#DCFCE7', // Light Green (Green-100) for backgrounds
        accent: '#FBBF24', // Amber/Yellow (keeps the pop)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
