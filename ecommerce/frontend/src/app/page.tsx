'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Banknote, RotateCcw, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ErrorState, ProductGridSkeleton } from '../components/Loading';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    api
      .get('/products')
      .then((d) => setProducts(d.products ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);

  return (
    <div className="wrap py-5">
      {/* Intro: one compact row instead of a full-screen hero */}
      <section className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="h-hero">Shop what you love.</h1>
          <p className="mt-0.5 text-[13px] text-mute">Beautifully made. Fairly priced. Pay when it arrives.</p>
        </div>
        <Link href="/products" className="btn-primary">
          Browse all
        </Link>
      </section>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/products?category=${encodeURIComponent(c)}`}
              className="shrink-0 rounded-md border border-line px-3 py-1 text-xs text-ink transition hover:bg-canvas"
            >
              {c}
            </Link>
          ))}
        </nav>
      )}

      <section className="mt-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="h-section">Featured</h2>
          <Link href="/products" className="link link-more text-xs text-mute">
            See all
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : err ? (
          <ErrorState message={err} onRetry={load} />
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-[13px] text-mute">No products yet. Run the seed script to add some.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.slice(0, 10).map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* Value props: a single quiet row */}
      <section className="mt-8 grid gap-3 border-t border-line pt-4 text-xs text-mute sm:grid-cols-3">
        {[
          { icon: Banknote, title: 'Pay on delivery', body: 'Cash when your order arrives.' },
          { icon: ShieldCheck, title: 'Quality checked', body: 'Inspected before it ships.' },
          { icon: RotateCcw, title: 'Easy returns', body: 'Simple, stress-free.' },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-center gap-2.5">
            <Icon size={16} strokeWidth={1.5} className="shrink-0 text-ink" />
            <p>
              <span className="font-medium text-ink">{title}.</span> {body}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
