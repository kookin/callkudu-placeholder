/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './assets/**/*.{js,css}', './privacy.html', './terms.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans Flex"', '"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
        display: ['"Google Sans Flex"', '"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.02em',
        tighter: '-0.04em',
      },
      colors: {
        navy: {
          950: '#0B1221',
          900: '#131C2E',
          850: '#1A2438',
          800: '#232E45',
          500: '#64748b',
          400: '#475569',
        },
        primary: {
          50: '#FFF0E6',
          100: '#FFE4D4',
          200: '#FFCCAA',
          400: '#FF8F60',
          500: '#FF6B2C',
          600: '#E85A1F',
          700: '#C44E14',
        },
        orange: {
          100: '#FFF0E6',
          400: '#FF8F60',
          500: '#FF6B2C',
          600: '#E85A1F',
        },
        secondary: {
          50: '#edfafe',
          100: '#d5f3f8',
          200: '#aee8f2',
          400: '#54d3e5',
          500: '#54d3e5',
          600: '#3bb8cc',
          700: '#2d96a8',
        },
        cream: {
          50: '#F9F8F4',
          100: '#F0EFE9',
          200: '#E6E4DC',
          500: '#A19F9A',
        },
        brandgreen: {
          400: '#6AD27D',
          500: '#47C25E',
        },
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '0.5rem' },
          '50%': { height: '3rem' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        wave: 'wave 1s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
