/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        shine: 'shine 5s linear infinite',
        gradient: 'gradient 8s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out',
        scaleIn: 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%) rotate(-45deg)' },
          '100%': { transform: 'translateX(200%) rotate(-45deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
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
