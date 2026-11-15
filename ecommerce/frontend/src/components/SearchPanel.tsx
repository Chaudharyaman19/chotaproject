'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { api, isAbort } from '../lib/api';
import { useDebounce } from '../lib/useDebounce';
import { formatPrice } from '../lib/format';
import { Product } from '../types';

/**
 * Live search drop-down under the nav.
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
      .get(`/products?search=${encodeURIComponent(term)}`, { signal: ctrl.signal })
      .then((d) => setResults((d.products ?? []).slice(0, 5)))
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
    <div role="dialog" aria-label="Search" className="fixed inset-x-0 top-11 z-[55] max-h-[calc(100vh-44px)] animate-fade-in overflow-y-auto border-b border-line bg-white pb-4">
      <div className="wrap-sm pt-3">
        <form onSubmit={submit} className="flex items-center gap-2 border-b border-line pb-2">
          <Search size={16} className="shrink-0 text-mute" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-mute/70 [&::-webkit-search-cancel-button]:hidden"
          />
        </form>

        <div aria-live="polite" className="mt-3">
          {term.length < 2 ? (
            <ul className="space-y-1.5 text-[13px]">
              {[
                ['/products', 'Browse all products'],
                ['/cart', 'Your bag'],
                ['/orders', 'Track your orders'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} onClick={onClose} className="group inline-flex items-center gap-2 hover:underline">
                    <ArrowRight size={12} className="text-mute transition group-hover:translate-x-0.5" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : busy ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="text-[13px] text-mute">No results for “{term}”.</p>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {results.map((p) => (
                  <li key={p._id}>
                    <Link href={`/products/${p._id}`} onClick={onClose} className="flex items-center gap-3 py-2 hover:opacity-70">
                      <img src={p.image} alt="" className="h-9 w-9 rounded-md bg-canvas object-cover" />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{p.name}</span>
                      <span className="text-xs text-mute">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button onClick={submit} className="link link-more mt-2 text-[13px]">
                See all results for “{term}”
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
