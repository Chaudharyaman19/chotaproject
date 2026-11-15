'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { api, isAbort } from '../../lib/api';
import { useDebounce } from '../../lib/useDebounce';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import { ErrorState, ProductGridSkeleton } from '../../components/Loading';

function ShopView() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [cat, setCat] = useState(params.get('category') ?? '');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [attempt, setAttempt] = useState(0); // bump to retry after an error

  // Navbar search / category links point here with ?search= / ?category=; keep state in sync.
  useEffect(() => {
    setSearch(params.get('search') ?? '');
    setCat(params.get('category') ?? '');
  }, [params]);

  // Debounce: only hit the API ~350ms after the user stops typing.
  const debouncedSearch = useDebounce(search.trim(), 350);

  useEffect(() => {
    // Abort: if filters change before the last request returns, cancel it so a slow
    // old response can't overwrite the newer one (classic race condition).
    const ctrl = new AbortController();
    const q = new URLSearchParams();
    if (debouncedSearch) q.set('search', debouncedSearch);
    if (cat) q.set('category', cat);
    if (sort) q.set('sort', sort);

    setLoading(true);
    setErr('');
    api
      .get(`/products?${q.toString()}`, { signal: ctrl.signal })
      .then((d) => {
        setProducts(d.products ?? []);
        setCategories(d.categories ?? []);
      })
      .catch((e) => !isAbort(e) && setErr(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [debouncedSearch, cat, sort, attempt]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-md border px-3 py-1 text-xs transition ${active ? 'border-ink bg-ink font-medium text-white' : 'border-line bg-white text-ink hover:bg-canvas'}`;

  return (
    <div className="wrap py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="h-page">Shop</h1>
        {!loading && !err && (
          <p aria-live="polite" className="text-xs text-mute">
            {products.length} {products.length === 1 ? 'product' : 'products'}
            {debouncedSearch && <> for “{debouncedSearch}”</>}
          </p>
        )}
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-11 z-30 -mx-4 mt-3 border-b border-line bg-white/90 px-4 py-2 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Categories">
            <button role="tab" aria-selected={cat === ''} onClick={() => setCat('')} className={chip(cat === '')}>
              All
            </button>
            {categories.map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={chip(cat === c)}>
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex h-8 flex-1 items-center gap-2 rounded-md border border-line bg-white px-2.5 transition focus-within:border-ink md:w-52 md:flex-none">
              <Search size={13} className="shrink-0 text-mute" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                placeholder="Search"
                aria-label="Search products"
                className="w-full bg-transparent text-xs outline-none placeholder:text-mute [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="text-mute hover:text-ink">
                  <X size={13} />
                </button>
              )}
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className="select">
              <option value="">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      <section className="mt-4 min-h-[50vh]">
        {loading ? (
          <ProductGridSkeleton />
        ) : err ? (
          <ErrorState message={err} onRetry={() => setAttempt((n) => n + 1)} />
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium">No results.</p>
            <p className="mt-1 text-xs text-mute">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// useSearchParams() must sit under a Suspense boundary for static prerendering.
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="wrap py-5"><ProductGridSkeleton /></div>}>
      <ShopView />
    </Suspense>
  );
}
