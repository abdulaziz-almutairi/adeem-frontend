/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary + secondary scales extracted from the أديم logo mark (deep purple -> hot magenta/pink knot),
        // tuned to match the approved hero gradient below. Every interactive color in the app should come from
        // brand/accent/success/warning/danger — no ad-hoc hex values or unrelated stock Tailwind hues.
        brand: { 50:'#faf5fb',100:'#f3e6f5',200:'#e6c8ec',300:'#d29fdd',400:'#b672c8',500:'#9a52ac',600:'#7a2e8f',700:'#632475',800:'#4d1c5b',900:'#391542',950:'#230d29' },
        accent: { 50:'#fef1f6',100:'#fde3ee',200:'#fbc0dc',300:'#f691bf',400:'#ef5a9c',500:'#e31c6e',600:'#c01259',700:'#9c0f48',800:'#7a0f3a',900:'#5c0e2d' },
        dark: { 800:'#1e293b',900:'#0f172a' },
        // Semantic status colors stay independent of brand hue on purpose (users must recognize
        // error/success/warning by color regardless of theme) - values verified for WCAG AA.
        success: { 50:'#ecfdf5',100:'#d1fae5',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857' },
        warning: { 50:'#fffbeb',100:'#fef3c7',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309' },
        danger: { 50:'#fef2f2',100:'#fee2e2',200:'#fecaca',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c' },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7a2e8f 0%, #e31c6e 70%, #f0447e 100%)',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}