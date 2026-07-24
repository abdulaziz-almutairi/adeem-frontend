/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#faf5ff',100:'#f3e8ff',200:'#e9d5ff',300:'#d8b4fe',400:'#c084fc',500:'#a855f7',600:'#9333ea',700:'#7e22ce',800:'#6b21a8',900:'#581c87' },
        accent: { 400:'#fb7185',500:'#f43f5e',600:'#e11d48',700:'#be123c' },
        dark: { 800:'#1e293b',900:'#0f172a' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #9333ea 0%, #e11d48 100%)',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}