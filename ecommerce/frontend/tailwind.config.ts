import type { Config } from 'tailwindcss';

/**
 * Design tokens: minimal + compact. Monochrome palette, hairline borders, no shadows,
 * small type (14px base) and tight spacing so more of the catalogue fits on screen.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111', // primary text + primary buttons
        mute: '#6b6b6b', // secondary text
        canvas: '#f6f6f6', // soft grey surface
        line: '#e4e4e4', // hairlines / input borders
        warn: '#b45309', // "only 3 left" highlights
        accent: {
          DEFAULT: '#111111',
          hover: '#2a2a2a',
          link: '#111111',
          ondark: '#ffffff',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'var(--font-inter)',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '60%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'fade-up': 'fade-up .25s ease-out both',
        'fade-in': 'fade-in .15s ease-out both',
        pop: 'pop .3s cubic-bezier(.22,.61,.36,1) both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
