/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        honolulu: {
          50: '#EBF6FC',
          100: '#D0ECF9',
          200: '#A1D9F3',
          300: '#6DC3EB',
          400: '#3AAEE3',
          500: '#0077B6',
          600: '#006399',
          700: '#004F7D',
          800: '#003B5E',
          900: '#002740',
        },
        amethyst: {
          50: '#F5F0FB',
          100: '#EAD9F7',
          200: '#D5B3EF',
          300: '#BF8DE7',
          400: '#AA67DF',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        surface: {
          50: '#FAFBFE',
          100: '#F3F5FB',
          200: '#E8ECF6',
          300: '#DCE1F0',
          400: '#C5CCDF',
          500: '#94A0BC',
          600: '#64708E',
        },
      },
      boxShadow: {
        panel: '0 8px 32px rgba(0, 119, 182, 0.08)',
        'panel-hover': '0 16px 48px rgba(0, 119, 182, 0.14)',
        glow: '0 0 24px rgba(0, 119, 182, 0.12)',
        'glow-purple': '0 0 24px rgba(139, 92, 246, 0.10)',
        card: '0 4px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 36px rgba(0, 119, 182, 0.12)',
        soft: '0 2px 12px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
