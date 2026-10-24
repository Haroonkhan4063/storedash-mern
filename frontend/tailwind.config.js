/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#060813', 900: '#0a0e1e', 850: '#0e1328', 800: '#131a35', 700: '#1c2548', 600: '#2a3562' },
        neon: { violet: '#8b5cf6', cyan: '#22d3ee', mint: '#34d399' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', '"DM Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 48px -10px rgba(139, 92, 246, 0.55)',
        'glow-cyan': '0 0 40px -12px rgba(34, 211, 238, 0.5)',
      },
      keyframes: {
        'toast-in': { from: { opacity: 0, transform: 'translateY(-12px) scale(0.97)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
        rise: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        rise: 'rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};
