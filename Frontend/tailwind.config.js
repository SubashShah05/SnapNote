/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        snap: {
          bg:       '#0a0a0f',
          surface:  '#111118',
          card:     '#16161f',
          border:   '#1e1e2e',
          accent:   '#4f6ef7',
          'accent-hover': '#6b86fa',
          muted:    '#6b7280',
          subtle:   '#374151',
        },
      },
      animation: {
        'float-slow':  'floatSlow 6s ease-in-out infinite',
        'float-fast':  'floatFast 4s ease-in-out infinite',
        'marquee':     'marquee 30s linear infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':   'spin 12s linear infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'grid-dark': "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        'radial-glow': 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(79,110,247,0.12), transparent)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
    },
  },
  plugins: [],
}