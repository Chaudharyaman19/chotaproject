import type { Config } from 'tailwindcss';

/**
 * Design tokens. Every colour is an RGB triplet CSS variable (set per theme / per section "tone"
 * in globals.css) so Tailwind opacity modifiers keep working: `border-fg/30`, `bg-panel/60`, ...
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), // page / section background
        fg: v('fg'), // body text
        head: v('head'), // headings
        panel: v('panel'), // raised surfaces, inputs
        accent: v('accent'), // brand purple (fills)
        onaccent: v('onaccent'), // text on accent fills
        accentfg: v('accentfg'), // accent used as text colour
        warn: v('warn'), // amber for warnings / low stock
        danger: '#f92e21',
        ok: '#47d1b5',
      },
      fontFamily: {
        sans: ['var(--font-sans)', '"Untitled Sans"', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', '"Degrad Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-in': 'fade-in .25s ease-out both',
        'fade-up': 'fade-up .5s cubic-bezier(.22,.61,.36,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
