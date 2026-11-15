'use client';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/** Wordmark: a crosshair mark (nod to the blueprint grid) + lowercase name. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="ShopEasy home" className={`inline-flex items-center gap-2.5 text-head ${className}`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 5v12M5 11h12" stroke="rgb(var(--accentfg))" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[20px] font-medium leading-none tracking-[-0.05em] sm:text-[24px]">shopeasy</span>
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
