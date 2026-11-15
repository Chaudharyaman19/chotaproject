'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Banknote, Check, ChevronLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import { api, isAbort } from '../../../lib/api';
import { formatPrice } from '../../../lib/format';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';
import QtyStepper from '../../../components/QtyStepper';
import Loading from '../../../components/Loading';

export default function ProductDetail() {
  const { id } = useParams() as { id: string };
  const { add } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    api
      .get(`/products/${id}`, { signal: ctrl.signal })
      .then(setP)
      .catch((e) => !isAbort(e) && setP(null))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [id]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (loading) return <Loading />;
  if (!p)
    return (
      <div className="wrap-sm py-16 text-center">
        <h1 className="h-page">We couldn’t find that product.</h1>
        <Link href="/products" className="link link-more mt-2 inline-block text-[13px]">
          Back to shop
        </Link>
      </div>
    );

  const soldOut = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;

  const onAdd = () => {
    add(p, qty);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="wrap py-5">
      <Link href="/products" className="link inline-flex items-center text-xs text-mute">
        <ChevronLeft size={14} /> Shop
      </Link>

      <div className="mt-3 grid gap-6 md:grid-cols-[minmax(0,420px)_1fr] md:gap-10">
        <div className="aspect-square overflow-hidden rounded-lg border border-line bg-canvas md:sticky md:top-16 md:self-start">
          <img src={p.image} alt={p.name} className={`h-full w-full object-cover ${soldOut ? 'opacity-60 grayscale' : ''}`} />
        </div>

        <div>
          <p className={`text-[11px] font-medium uppercase tracking-wide ${low ? 'text-warn' : 'text-mute'}`}>{low ? `Only ${p.stock} left` : p.category}</p>
          <h1 className="mt-1 text-xl font-semibold leading-tight tracking-tight md:text-2xl">{p.name}</h1>
          <p className="mt-1.5 text-lg font-medium">{formatPrice(p.price)}</p>

          <p className="mt-3 text-[13px] leading-relaxed text-mute">{p.description}</p>

          <p className={`mt-4 flex items-center gap-1.5 text-xs font-medium ${soldOut ? 'text-mute' : 'text-[#1d7a36]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${soldOut ? 'bg-mute' : 'bg-[#1d7a36]'}`} />
            {soldOut ? 'Out of stock' : `In stock · ${p.stock} available`}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <QtyStepper value={qty} min={1} max={Math.max(1, p.stock)} onChange={setQty} />
            <button disabled={soldOut} onClick={onAdd} className={`btn flex-1 text-white md:max-w-[220px] ${added ? 'bg-[#1d7a36]' : 'bg-ink hover:bg-accent-hover'}`}>
              {added ? (
                <>
                  <Check size={14} className="animate-pop" /> Added to bag
                </>
              ) : (
                'Add to bag'
              )}
            </button>
            {added && (
              <Link href="/cart" className="link link-more text-[13px]">
                View bag
              </Link>
            )}
          </div>

          <ul className="mt-6 divide-y divide-line border-y border-line text-xs">
            {[
              { icon: Banknote, title: 'Cash on delivery', body: 'Pay when your order arrives.' },
              { icon: ShieldCheck, title: 'Quality checked', body: 'Inspected before it ships.' },
              { icon: RotateCcw, title: 'Easy returns', body: 'Simple, stress-free returns.' },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-center gap-2.5 py-2">
                <Icon size={15} strokeWidth={1.5} className="shrink-0" />
                <p>
                  <span className="font-medium">{title}</span> <span className="text-mute">· {body}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
