'use client';
import { ElementType, ReactNode, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, registerGsap } from '../../lib/gsap';

/** "+" crosshair marker for the blueprint grid. */
export const X = ({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) => <i aria-hidden className={`plus plus-${at}`} />;

/** Dotted cell with crosshairs on its top corners. Compose them in a bordered grid. */
export function Cell({ children, className = '', all = false }: { children: ReactNode; className?: string; all?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <X at="tl" />
      <X at="tr" />
      {all && (
        <>
          <X at="bl" />
          <X at="br" />
        </>
      )}
      {children}
    </div>
  );
}

/**
 * Headline whose words rise out of a mask when scrolled into view (GSAP + ScrollTrigger).
 * Server/first paint shows the full text, so nothing is ever hidden if JS fails.
 */
export function SplitReveal({
  text,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  stagger = 0.055,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (prefersReducedMotion() || !el || typeof IntersectionObserver === 'undefined') return;
    const { gsap } = registerGsap();
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-w]'));
    gsap.set(words, { yPercent: 118 });
    let tween: gsap.core.Tween | undefined;
    // IntersectionObserver (not ScrollTrigger): independent of pin spacers and layout refreshes.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(words, { yPercent: 0, duration: 1.05, ease: 'power4.out', stagger, delay });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      gsap.set(words, { clearProps: 'transform' });
    };
  }, [text, delay, stagger]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom [margin-bottom:-0.1em]">
          <span data-w className="inline-block will-change-transform">
            {w}
          </span>
          {' '}
        </span>
      ))}
    </Tag>
  );
}

/** Fade + rise on scroll. Only hides content that starts below the fold, and only after mount. */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'visible' | 'hidden' | 'shown'>('visible');

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already on screen: leave it be
    setState('hidden');
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState('shown');
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: state === 'shown' ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] ${state === 'hidden' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'} ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Number that counts up once it enters the viewport. */
export function Counter({ to, decimals = 0, prefix = '', suffix = '', className = '' }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (prefersReducedMotion() || !el || typeof IntersectionObserver === 'undefined') return;
    const { gsap } = registerGsap();
    const obj = { v: 0 };
    el.textContent = fmt(0);
    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        tween = gsap.to(obj, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(obj.v)), onComplete: () => (el.textContent = fmt(to)) });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = fmt(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {fmt(to)}
    </span>
  );
}

/** Endless horizontal ticker. Content is duplicated so the -50% loop is seamless. */
export function Marquee({ children, className = '', speed = 40 }: { children: ReactNode; className?: string; speed?: number }) {
  return (
    <div className={`group flex overflow-hidden ${className}`} aria-hidden>
      <div className="flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]" style={{ animationDuration: `${speed}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </div>
    </div>
  );
}

/** Star rating (0-5) drawn with an overlay so partial values render exactly. */
export function Stars({ value, className = '' }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  return (
    <span className={`relative inline-block text-[13px] leading-none tracking-[2px] ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5`}>
      <span className="text-fg/30">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden text-accentfg" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
