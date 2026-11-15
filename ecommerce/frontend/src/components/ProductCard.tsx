'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const soldOut = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;

  const onAdd = () => {
    add(p);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/products/${p._id}`} aria-label={p.name} className="relative block aspect-square overflow-hidden rounded-lg border border-line bg-canvas">
        <img
          src={p.image}
          alt=""
          loading="lazy"
          decoding="async"
          // If a seeded image URL ever disappears, fall back to the plain grey tile instead of a broken-image icon.
          onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${soldOut ? 'opacity-50 grayscale' : ''}`}
        />
        {soldOut && <span className="absolute left-2 top-2 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-mute">Sold out</span>}
      </Link>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-medium">
            <Link href={`/products/${p._id}`} className="hover:underline">
              {p.name}
            </Link>
          </h3>
          <p className={`truncate text-[11px] ${low ? 'text-warn' : 'text-mute'}`}>{low ? `Only ${p.stock} left` : p.category}</p>
        </div>
        <span className="shrink-0 text-[13px] font-medium tabular-nums">{formatPrice(p.price)}</span>
      </div>

      <button
        type="button"
        disabled={soldOut}
        onClick={onAdd}
        className={`btn btn-sm mt-2 w-full ${added ? 'bg-[#1d7a36] text-white' : 'border border-line bg-white text-ink hover:bg-ink hover:text-white'}`}
      >
        {added ? (
          <>
            <Check size={13} className="animate-pop" /> Added
          </>
        ) : (
          <>
            <Plus size={13} /> Add to bag
          </>
        )}
      </button>
    </article>
  );
}
