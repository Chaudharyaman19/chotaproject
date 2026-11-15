'use client';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion, registerGsap } from '../../lib/gsap';

/**
 * Animated halftone dot-field that swells around the pointer, plus a dotted "scanner" reticle that
 * follows it (a nod to the reference site's hero). Pauses when off-screen; static for reduced motion.
 */
export default function HeroCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext('2d')!;
    const reduce = prefersReducedMotion();
    let w = 0, h = 0, raf = 0, visible = true, frame = 0;
    let fg = '175,184,194', accent = '213,145,254';
    const ptr = { x: -9999, y: -9999, sx: -9999, sy: -9999 };

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      const triplet = (n: string) => cs.getPropertyValue(n).trim().split(/\s+/).join(',');
      fg = triplet('--fg') || fg;
      accent = triplet('--accentfg') || accent;
    };
    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      if (frame++ % 20 === 0) readColors();
      ctx.clearRect(0, 0, w, h);
      ptr.sx += (ptr.x - ptr.sx) * 0.12;
      ptr.sy += (ptr.y - ptr.sy) * 0.12;
      const step = w < 700 ? 20 : 17;
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const nx = x / w, ny = y / h;
          let v = Math.sin(nx * 6 + t * 0.0006) * Math.cos(ny * 5 - t * 0.0005) + Math.sin((nx + ny) * 9 + t * 0.0009) * 0.5;
          v = Math.min(1, Math.max(0, v * 0.5 + 0.5)); // clamp to 0..1
          const dx = x - ptr.sx, dy = y - ptr.sy;
          const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 230);
          const r = Math.max(0.3, 0.5 + v * 2.6 + near * 4.2);
          ctx.fillStyle = near > 0.05 ? `rgba(${accent},${0.35 + near * 0.6})` : `rgba(${fg},${0.06 + v * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.2832);
          ctx.fill();
        }
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop); // schedule first: a thrown frame must not end the animation
      if (visible) draw(t);
    };

    resize();
    readColors();
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(0); });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(host);

    const { gsap } = registerGsap();
    const reticle = reticleRef.current;
    const qx = reticle ? gsap.quickTo(reticle, 'x', { duration: 0.7, ease: 'power3' }) : null;
    const qy = reticle ? gsap.quickTo(reticle, 'y', { duration: 0.7, ease: 'power3' }) : null;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      qx?.(ptr.x - 40);
      qy?.(ptr.y - 40);
    };
    const onLeave = () => { ptr.x = ptr.y = -9999; };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);

    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div ref={reticleRef} className="absolute left-0 top-0 hidden h-20 w-20 border border-dotted border-accentfg md:block" style={{ transform: 'translate(46vw, 38vh)' }}>
        <i className="plus plus-tl !text-accentfg" />
        <i className="plus plus-tr !text-accentfg" />
        <i className="plus plus-bl !text-accentfg" />
        <i className="plus plus-br !text-accentfg" />
      </div>
    </div>
  );
}
