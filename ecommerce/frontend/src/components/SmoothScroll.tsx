'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { prefersReducedMotion, registerGsap } from '../lib/gsap';

/**
 * Inertial smooth scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger animations stay in sync.
 * Skipped for reduced-motion users and in the admin area (dense tables, nested scroll panes).
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const admin = pathname.startsWith('/admin');
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (admin || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [admin]);

  // Fonts finishing late shift layout; ScrollTrigger already refreshes on load/resize by itself.
  // (Do NOT observe body size here: pin spacers change it on every refresh and that loops forever.)
  useEffect(() => {
    const { ScrollTrigger } = registerGsap();
    document.fonts?.ready.then(() => window.setTimeout(() => ScrollTrigger.refresh(), 100));
  }, []);

  // New page: start at the top and recompute trigger positions once the new DOM has settled.
  useEffect(() => {
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true });
    const { ScrollTrigger } = registerGsap();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
