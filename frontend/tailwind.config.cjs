/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surfaceLight: 'rgba(255,255,255,0.75)',
        surfaceDark: 'rgba(30,41,59,0.7)'
      }
    }
  },
  plugins: []
};
