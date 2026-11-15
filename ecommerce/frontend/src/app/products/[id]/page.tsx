'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Banknote, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { api, isAbort } from '../../../lib/api';
import { discountPct, formatPrice } from '../../../lib/format';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';
import QtyStepper from '../../../components/QtyStepper';
import ProductCard, { isPhoto } from '../../../components/ProductCard';
import Loading from '../../../components/Loading';
import { Reveal, SplitReveal, Stars, X } from '../../../components/ui/Primitives';

export default function ProductDetail() {
  const { id } = useParams() as { id: string };
  const { add } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setActive(0);
    setQty(1);
    api
      .get(`/products/${id}`, { signal: ctrl.signal })
      .then((prod: Product) => {
        setP(prod);
        return api.get(`/products?category=${encodeURIComponent(prod.category)}&limit=8`, { signal: ctrl.signal });
      })
      .then((d) => setRelated((d.products ?? []).filter((r: Product) => r._id !== id).slice(0, 4)))
      .catch((e) => !isAbort(e) && setP((cur) => (cur?._id === id ? cur : null)))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [id]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (loading) return <Loading />;
  if (!p)
    return (
      <div className="wrap-sm flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
        <p className="eyebrow">404</p>
        <h1 className="h2 mt-4">Product not found</h1>
        <Link href="/products" className="pill mt-8">
          <ArrowLeft size={14} /> Back to shop
        </Link>
      </div>
    );

  const gallery = Array.from(new Set([p.image, ...(p.images ?? [])]));
  const soldOut = p.stock === 0;
  const low = p.stock > 0 && p.stock <= 5;
  const off = discountPct(p.price, p.compareAtPrice);
  const main = gallery[active] ?? p.image;

  const onAdd = () => {
    add(p, qty);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <div className="wrap pt-28 md:pt-32">
        <Link href="/products" className="link inline-flex items-center gap-2 font-mono text-[12px]">
          <ArrowLeft size={13} /> All products
        </Link>

        <div className="frame relative mt-6 grid border-y border-dotted border-fg/50 lg:grid-cols-[1.15fr_1fr]">
          <X at="tl" />
          <X at="tr" />
          <X at="bl" />
          <X at="br" />
          {/* gallery */}
          <div className="border-b border-dotted border-fg/50 lg:border-b-0 lg:border-r">
            <div className="shot relative aspect-square overflow-hidden lg:aspect-[5/5.2]">
              <img key={main} src={main} alt={p.name} className={`absolute inset-0 h-full w-full animate-fade-in ${isPhoto(main) ? 'object-cover' : 'object-contain p-8 md:p-14'} ${soldOut ? 'opacity-50 grayscale' : ''}`} />
              {off > 0 && !soldOut && <span className="absolute left-4 top-4 rounded-full bg-[#121314] px-3 py-1.5 font-mono text-[12px] text-[#d591fe]">−{off}% off</span>}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 border-t border-dotted border-fg/50 p-3">
                {gallery.slice(0, 6).map((g, i) => (
                  <button key={g} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-current={i === active} className={`shot h-20 w-20 shrink-0 overflow-hidden border transition-all ${i === active ? 'border-accentfg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={g} alt="" className={`h-full w-full ${isPhoto(g) ? 'object-cover' : 'object-contain p-1.5'}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* details */}
          <div className="flex flex-col p-6 md:p-10 lg:p-12">
            <p className={`eyebrow ${low ? '!text-accentfg' : ''}`}>{low ? `Only ${p.stock} left` : `${p.category}${p.brand ? ` · ${p.brand}` : ''}`}</p>
            <SplitReveal text={p.name} as="h1" className="mt-4 text-[clamp(2rem,3.8vw,3.6rem)] font-medium uppercase leading-[0.98] tracking-[-0.035em] text-head" />

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-[2rem] font-medium leading-none tracking-[-0.03em] text-head">{formatPrice(p.price)}</span>
              {off > 0 && <span className="font-mono text-[14px] text-fg/60 line-through">{formatPrice(p.compareAtPrice!)}</span>}
              {!!p.rating && p.rating > 0 && (
                <span className="flex items-center gap-2 font-mono text-[12px]">
                  <Stars value={p.rating} /> {p.rating.toFixed(1)}
                </span>
              )}
            </div>

            <p className="mono mt-6 max-w-[60ch]">{p.description}</p>

            <p className={`mt-6 inline-flex items-center gap-2 font-mono text-[12px] ${soldOut ? '' : 'text-ok'}`}>
              <span className={`h-2 w-2 rounded-full ${soldOut ? 'bg-fg/60' : 'bg-ok'}`} />
              {soldOut ? 'Currently out of stock' : `In stock · ${p.stock} available`}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <QtyStepper value={qty} min={1} max={Math.max(1, p.stock)} onChange={setQty} />
              <button disabled={soldOut} onClick={onAdd} className={`pill-lg pill min-w-[220px] flex-1 sm:flex-none ${added ? '!border-transparent !bg-ok !text-[#121314]' : 'pill-accent'}`}>
                {added ? (
                  <>
                    <Check size={16} className="animate-fade-in" /> Added to bag
                  </>
                ) : (
                  'Add to bag'
                )}
              </button>
              {added && (
                <Link href="/cart" className="link font-mono text-[13px]">
                  View bag
                </Link>
              )}
            </div>

            <ul className="mt-10 divide-y divide-dotted divide-fg/50 border-y border-dotted border-fg/50">
              {[
                { icon: Banknote, title: 'Cash on delivery', body: 'Pay when your order arrives.' },
                { icon: ShieldCheck, title: 'Free delivery over $50', body: 'Flat $4.99 below that.' },
                { icon: RotateCcw, title: 'Easy cancellation', body: 'Cancel pending orders yourself.' },
              ].map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-center gap-4 py-4">
                  <Icon size={20} strokeWidth={1.4} className="shrink-0 text-accentfg" />
                  <p className="text-[15px] text-head">
                    {title} <span className="mono text-fg"> · {body}</span>
                  </p>
                </li>
              ))}
            </ul>

            {(p.tags?.length || p.sku) && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {p.tags?.map((t) => (
                  <Link key={t} href={`/products?search=${encodeURIComponent(t)}`} className="pill pill-sm">
                    {t}
                  </Link>
                ))}
                {p.sku && <span className="ml-auto font-mono text-[11px]">SKU {p.sku}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="wrap py-16 md:py-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SplitReveal text="More like this" as="h2" className="h2" />
            <Reveal>
              <Link href={`/products?category=${encodeURIComponent(p.category)}`} className="pill pill-sm">
                All {p.category}
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-dotted border-fg/50 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r._id} p={r} className="border-b border-r border-dotted border-fg/50" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
