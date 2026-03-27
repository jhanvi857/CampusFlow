/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#EAF4FC',
          100: '#D8EAF8',
          500: '#0077B6',
          700: '#005A8B',
          800: '#1C39BB',
        },
      },
      boxShadow: {
        panel: '0 16px 40px rgba(17, 40, 62, 0.08)',
      },
    },
  },
  plugins: [],
}

