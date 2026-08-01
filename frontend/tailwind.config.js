/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0A08',
        elevated: '#141210',
        panel: '#1A1815',
        line: '#2A2620',
        'line-soft': '#211E19',
        cream: '#F3EEE3',
        amber: '#E8A33D',
        'amber-dim': '#B87F2C',
        sage: '#8FA876',
        rose: '#C1666B',
        teal: '#4FA89B',
        coral: '#E0785A',
        violet: '#8E7FD1',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'monospace'],
      },
      keyframes: {
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        ringDraw: {
          '0%': { strokeDashoffset: 'var(--ring-circumference)' },
          '100%': { strokeDashoffset: 'var(--ring-offset)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        fadeIn: 'fadeIn 0.5s ease-out both',
        ringDraw: 'ringDraw 1s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};
