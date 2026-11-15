'use client';
import { Product } from '../../types';
import { isPhoto } from '../ProductCard';

/**
 * Isometric stack of "plates", one per category. The active category's plate lifts out of the
 * stack and takes the accent colour; the others sink back and dim. Pure CSS 3D + transitions.
 */
export default function Stack3D({ items, active }: { items: { label: string; product?: Product }[]; active: number }) {
  const gap = 56;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden>
      <div className="absolute inset-[12%]" style={{ perspective: '1600px' }}>
        <div className="relative h-full w-full" style={{ transform: 'rotateX(58deg) rotateZ(-38deg)', transformStyle: 'preserve-3d' }}>
          {items.map((it, i) => {
            const on = i === active;
            const z = (items.length - 1 - i) * gap + (on ? 70 : 0) - 120;
            return (
              <div
                key={it.label}
                className="absolute inset-0 overflow-hidden rounded-[6px] border"
                style={{
                  transform: `translateZ(${z}px)`,
                  transition: 'transform .9s cubic-bezier(.22,.61,.36,1), filter .6s, border-color .6s, box-shadow .6s',
                  borderColor: on ? 'rgb(213 145 254)' : 'rgb(18 19 20 / .55)',
                  background: '#17181a',
                  filter: on ? 'none' : 'brightness(.5) saturate(.6)',
                  boxShadow: on ? '0 40px 60px -20px rgba(18,19,20,.55), 0 0 0 1px rgba(213,145,254,.5)' : '0 18px 24px -14px rgba(0,0,0,.6)',
                }}
              >
                {it.product && <img src={it.product.image} alt="" loading="lazy" className={`h-full w-full ${isPhoto(it.product.image) ? 'object-cover' : 'object-contain p-8'}`} style={{ background: on ? '#e8e4dc' : '#2a2c2f', mixBlendMode: on ? 'normal' : 'luminosity' }} />}
                <span className="absolute bottom-2 left-3 font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: on ? '#121314' : 'rgb(175 184 194 / .8)' }}>
                  {String(i + 1).padStart(2, '0')} · {it.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
