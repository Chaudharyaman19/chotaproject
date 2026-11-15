'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { api, isAbort } from '../lib/api';
import { useDebounce } from '../lib/useDebounce';
import { formatPrice } from '../lib/format';
import { Product } from '../types';
import { isPhoto } from './ProductCard';

/**
 * Live search overlay under the header.
 *  - debounce: waits 300ms after the last keystroke before calling the API
 *  - abort:    cancels the previous in-flight request, so out-of-order responses are impossible
 */
export default function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const term = useDebounce(q.trim(), 300);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (term.length < 2) {
      setResults([]);
      setBusy(false);
      return;
    }
    const ctrl = new AbortController();
    setBusy(true);
    api
      .get(`/products?search=${encodeURIComponent(term)}&limit=6`, { signal: ctrl.signal })
      .then((d) => setResults(d.products ?? []))
      .catch((e) => !isAbort(e) && setResults([]))
      .finally(() => !ctrl.signal.aborted && setBusy(false));
    return () => ctrl.abort();
  }, [term]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/products?search=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  return (
    <div role="dialog" aria-label="Search" data-lenis-prevent className="fixed inset-x-0 top-[72px] z-[55] max-h-[calc(100vh-72px)] animate-fade-in overflow-y-auto border-b border-dotted border-fg/40 bg-bg pb-10">
      <div className="wrap pt-6">
        <form onSubmit={submit} className="flex items-center gap-4 border-b border-dotted border-fg/60 pb-3">
          <Search size={26} className="shrink-0 text-fg" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Search products, brands…"
            aria-label="Search products"
            className="w-full bg-transparent text-[clamp(1.6rem,4vw,3rem)] font-medium tracking-[-0.03em] text-head outline-none placeholder:text-fg/40 [&::-webkit-search-cancel-button]:hidden"
          />
        </form>

        <div aria-live="polite" className="mt-6">
          {term.length < 2 ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="eyebrow mb-3">Quick links</p>
                <ul className="space-y-2 text-[18px] text-head">
                  {[['/products', 'Browse all products'], ['/products?featured=true', 'Featured picks'], ['/cart', 'Your bag'], ['/orders', 'Track your orders']].map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} onClick={onClose} className="group inline-flex items-center gap-2 hover:text-accentfg">
                        <ArrowRight size={14} className="text-fg transition group-hover:translate-x-1" /> {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : busy ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-16 w-full" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="font-mono text-[13px]">No results for “{term}”.</p>
          ) : (
            <>
              <p className="eyebrow mb-2">Suggested</p>
              <ul className="divide-y divide-dotted divide-fg/40">
                {results.map((p) => (
                  <li key={p._id}>
                    <Link href={`/products/${p._id}`} onClick={onClose} className="group flex items-center gap-4 py-3">
                      <img src={p.image} alt="" className={`shot h-14 w-14 shrink-0 ${isPhoto(p.image) ? 'object-cover' : 'object-contain p-1'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[18px] tracking-[-0.01em] text-head group-hover:text-accentfg">{p.name}</span>
                        <span className="eyebrow">{p.brand || p.category}</span>
                      </span>
                      <span className="font-mono text-[13px] text-head">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button onClick={submit} className="pill pill-sm mt-4">
                See all results for “{term}” <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
