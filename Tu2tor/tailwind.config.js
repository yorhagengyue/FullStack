/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', // Blue 50
          100: '#dbeafe', // Blue 100
          200: '#bfdbfe', // Blue 200
          300: '#93c5fd', // Blue 300
          400: '#60a5fa', // Blue 400
          500: '#3b82f6', // Blue 500
          600: '#2563eb', // Blue 600
          700: '#1d4ed8', // Blue 700
          800: '#1e40af', // Blue 800
          900: '#1e3a8a', // Blue 900
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
