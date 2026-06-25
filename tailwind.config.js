/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        surface: {
          0:   '#0f0f13',
          1:   '#16161d',
          2:   '#1e1e28',
          3:   '#262633',
          4:   '#2e2e3e',
        }
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'fade-in':   'fadeIn 0.3s ease both',
        'slide-in':  'slideIn 0.35s ease both',
        'pulse-slow':'pulse 3s ease-in-out infinite',
        'scan-line': 'scanLine 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scanLine: { '0%, 100%': { top: '4px' }, '50%': { top: 'calc(100% - 4px)' } },
      }
    }
  },
  plugins: []
}
