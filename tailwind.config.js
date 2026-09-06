/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        safety: {
          navy: '#1e3a8a',
          blue: '#1e40af',
          sky: '#0284c7',
          alert: '#dc2626',
          warn: '#d97706',
        },
      },
      boxShadow: {
        panel: '0 10px 40px -12px rgba(30, 64, 175, 0.18)',
      },
      fontFamily: {
        sans: ['"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
