'use client';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/** Storefront mark: a scalloped awning over a shop front with a door (the accent colour follows the theme). */
export function LogoMark({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      {/* awning */}
      <path d="M5 4H27L30 12a3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0Z" fill="rgb(var(--accentfg))" fillOpacity=".3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M11 4 9 12M16 4v8M21 4l2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".55" />
      {/* shop front */}
      <path d="M5 15.5V27a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      {/* door */}
      <path d="M13 28v-7.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V28Z" fill="rgb(var(--accentfg))" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="17.3" cy="24.2" r=".9" fill="currentColor" />
    </svg>
  );
}

/** Brand lockup used in the navbar, footer and admin sidebar. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="Apni Dukan home" className={`group inline-flex items-center gap-2.5 text-head ${className}`}>
      <LogoMark className="transition-transform duration-500 group-hover:-rotate-6" />
      <span className="text-[21px] font-medium leading-none tracking-[-0.045em] sm:text-[25px]">Apni Dukan</span>
    </Link>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button type="button" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`} className={`icon-btn ${className}`}>
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
