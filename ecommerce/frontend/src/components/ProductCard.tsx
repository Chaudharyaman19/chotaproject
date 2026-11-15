'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { discountPct, formatPrice } from '../lib/format';
import { Stars } from './ui/Primitives';

/** Photos (Unsplash) fill the tile; cut-out product shots (transparent WebP) sit inside it with padding. */
export const isPhoto = (src: string) => src.includes('unsplash.com');

export default function ProductCard({ p, className = '' }: { p: Product; className?: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const soldOut = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;
  const off = discountPct(p.price, p.compareAtPrice);
  const second = p.images?.find((i) => i !== p.image);
  const fit = isPhoto(p.image) ? 'object-cover' : 'object-contain p-5';

  const onAdd = () => {
    add(p);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className={`group relative flex h-full flex-col bg-bg ${className}`}>
      <div className="shot relative aspect-[4/5] overflow-hidden">
        <Link href={`/products/${p._id}`} aria-label={p.name} className="absolute inset-0 block">
          <img
            src={p.image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
            className={`absolute inset-0 h-full w-full transition-all duration-700 ease-out group-hover:scale-[1.04] ${fit} ${second ? 'group-hover:opacity-0' : ''} ${soldOut ? 'opacity-40 grayscale' : ''}`}
          />
          {second && <img src={second} alt="" loading="lazy" decoding="async" onError={(e) => (e.currentTarget.style.display = 'none')} className={`absolute inset-0 h-full w-full opacity-0 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-100 ${fit}`} />}
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && !soldOut && <span className="rounded-full bg-[#121314] px-2.5 py-1 font-mono text-[11px] leading-none text-[#d591fe]">−{off}%</span>}
          {soldOut && <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[11px] leading-none text-[#121314]">Sold out</span>}
          {low && <span className="rounded-full bg-[#d591fe] px-2.5 py-1 font-mono text-[11px] leading-none text-[#121314]">Only {p.stock} left</span>}
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={onAdd}
          aria-label={`Add ${p.name} to bag`}
          className={`absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full transition-all duration-300 disabled:hidden md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 ${added ? 'bg-ok text-[#121314]' : 'bg-[#121314] text-[#f8fcfd] hover:bg-[#d591fe] hover:text-[#121314]'}`}
        >
          {added ? <Check size={18} className="animate-fade-in" /> : <Plus size={18} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="eyebrow truncate">{p.brand || p.category}</p>
        <h3 className="line-clamp-2 text-[17px] leading-snug tracking-[-0.01em] text-head">
          <Link href={`/products/${p._id}`} className="hover:text-accentfg">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[14px] text-head">{formatPrice(p.price)}</span>
            {off > 0 && <span className="font-mono text-[12px] text-fg/60 line-through">{formatPrice(p.compareAtPrice!)}</span>}
          </div>
          {!!p.rating && p.rating > 0 && <Stars value={p.rating} />}
        </div>
      </div>
    </article>
  );
}
