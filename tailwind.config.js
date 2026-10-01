/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#0A1422', 900: '#0E1B2E', 800: '#15263D', 700: '#1F3452', 600: '#2B4467', 400: '#7F93AE', 300: '#A5B4C8', 200: '#C9D3E0' },
        char: { 900: '#1E2227', 800: '#2A2F36', 700: '#3A4049' },
        paper: '#F2F4F7',
        rule: '#D5DAE1',
        sun: { 500: '#F5B700', 400: '#FFC933', 100: '#FFF3CC' },
        leaf: { 600: '#1F8A4C', 500: '#2E9E5B', 100: '#DDF3E5' },
        pv: { 700: '#1D4FC4', 600: '#2563EB', 500: '#3B7BF5', 100: '#DCE8FE' },
        alarm: { 600: '#D23B30', 100: '#FBE1DF' },
      },
      fontFamily: {
        sans: ['Barlow', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        cond: ['"Barlow Semi Condensed"', 'Barlow', 'Arial Narrow', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
