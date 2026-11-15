'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/** Register GSAP plugins exactly once (client only) and hand back the instances. */
export function registerGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let refreshTimer: number | undefined;
/** Debounced ScrollTrigger.refresh() for after a layout change (async content, accordion toggle). */
export function refreshScrollTriggers(delay = 250) {
  if (typeof window === 'undefined') return;
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => registerGsap().ScrollTrigger.refresh(), delay);
}
