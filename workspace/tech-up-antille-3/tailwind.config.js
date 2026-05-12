/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        surface: '#18181B',
        border: '#27272A',
        primary: '#8B5CF6',
        accent: '#A78BFA',
        muted: '#A1A1AA',
      },
    },
  },
  plugins: [],
};