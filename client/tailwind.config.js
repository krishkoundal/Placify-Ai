/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA',
          light: '#818CF8'
        },
        secondary: {
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
          light: '#A78BFA'
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        darkBg: '#0F172A',
        lightBg: '#F8FAFC',
        textPrimaryDark: '#F1F5F9',
        textSecondaryDark: '#94A3B8',
        textPrimaryLight: '#111827',
        textSecondaryLight: '#6B7280'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
