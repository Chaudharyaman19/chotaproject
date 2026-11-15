'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X as XIcon } from 'lucide-react';
import { api, isAbort } from '../../lib/api';
import { useDebounce } from '../../lib/useDebounce';
import { refreshScrollTriggers } from '../../lib/gsap';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import PageHero from '../../components/PageHero';
import { ErrorState, ProductGridSkeleton } from '../../components/Loading';

const PAGE = 24;
const PRICES: { label: string; min?: number; max?: number }[] = [
  { label: 'Any price' },
  { label: 'Under $25', max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: '$100 – $500', min: 100, max: 500 },
  { label: '$500 +', min: 500 },
];

function ShopView() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [cat, setCat] = useState(params.get('category') ?? '');
  const [sort, setSort] = useState(params.get('sort') ?? '');
  const [featured, setFeatured] = useState(params.get('featured') === 'true');
  const [inStock, setInStock] = useState(false);
  const [price, setPrice] = useState(0);
  const [shown, setShown] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [attempt, setAttempt] = useState(0);

  // Header search / footer links arrive as ?search= ?category= ?featured= ?sort= ; keep state in sync.
  useEffect(() => {
    setSearch(params.get('search') ?? '');
    setCat(params.get('category') ?? '');
    setSort(params.get('sort') ?? '');
    setFeatured(params.get('featured') === 'true');
  }, [params]);

  const debounced = useDebounce(search.trim(), 350);

  useEffect(() => {
    // Abort: if filters change before the last request returns, cancel it so a slow old
    // response can't overwrite the newer one (classic race condition).
    const ctrl = new AbortController();
    const q = new URLSearchParams();
    if (debounced) q.set('search', debounced);
    if (cat) q.set('category', cat);
    if (sort) q.set('sort', sort);
    if (featured) q.set('featured', 'true');
    if (inStock) q.set('inStock', 'true');
    const pr = PRICES[price];
    if (pr.min !== undefined) q.set('minPrice', String(pr.min));
    if (pr.max !== undefined) q.set('maxPrice', String(pr.max));
    q.set('limit', '500');

    setLoading(true);
    setErr('');
    setShown(PAGE);
    api
      .get(`/products?${q.toString()}`, { signal: ctrl.signal })
      .then((d) => {
        setProducts(d.products ?? []);
        setCategories(d.categories ?? []);
      })
      .catch((e) => !isAbort(e) && setErr(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => {
        if (!ctrl.signal.aborted) {
          setLoading(false);
          refreshScrollTriggers(250);
        }
      });
    return () => ctrl.abort();
  }, [debounced, cat, sort, featured, inStock, price, attempt]);

  const visible = useMemo(() => products.slice(0, shown), [products, shown]);
  const chip = (on: boolean) => `pill pill-sm shrink-0 ${on ? '!border-accent !bg-accent !text-onaccent before:hidden' : ''}`;
  const activeFilters = !!(debounced || cat || featured || inStock || price);

  return (
    <>
      <PageHero eyebrow={cat || 'The catalogue'} title={cat || (featured ? 'Featured picks' : 'All products')}>
        {debounced ? `Results for “${debounced}”.` : 'Browse by collection, search by name or brand, and sort the way you shop.'}
      </PageHero>

      {/* sticky filter bar */}
      <div className="sticky top-[72px] z-30 mt-8 border-y border-dotted border-fg/50 bg-bg/90 backdrop-blur-md">
        <div className="wrap flex flex-col gap-3 py-3">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" role="tablist" aria-label="Collections">
            <button role="tab" aria-selected={cat === ''} onClick={() => setCat('')} className={chip(cat === '')}>
              All
            </button>
            {categories.map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={chip(cat === c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-full border border-fg/50 px-4 transition-colors focus-within:border-head lg:w-72 lg:flex-none">
              <Search size={14} className="shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder="Search" aria-label="Search products" className="w-full bg-transparent font-mono text-[12px] text-head outline-none placeholder:text-fg/60 [&::-webkit-search-cancel-button]:hidden" />
              {search && (
                <button type="button" aria-label="Clear search" onClick={() => setSearch('')} className="text-fg hover:text-head">
                  <XIcon size={14} />
                </button>
              )}
            </label>
            <select value={price} onChange={(e) => setPrice(Number(e.target.value))} aria-label="Filter by price" className="select">
              {PRICES.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className="select">
              <option value="">Featured first</option>
              <option value="newest">Newest</option>
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <button onClick={() => setInStock((v) => !v)} aria-pressed={inStock} className={chip(inStock)}>
              In stock
            </button>
            <button onClick={() => setFeatured((v) => !v)} aria-pressed={featured} className={chip(featured)}>
              Featured
            </button>
          </div>
        </div>
      </div>

      <section className="wrap min-h-[60vh] pb-24 pt-8">
        {!loading && !err && (
          <div aria-live="polite" className="mb-5 flex items-center justify-between">
            <p className="eyebrow">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
            {activeFilters && (
              <button
                className="link font-mono text-[12px]"
                onClick={() => {
                  setSearch('');
                  setCat('');
                  setFeatured(false);
                  setInStock(false);
                  setPrice(0);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <ProductGridSkeleton count={8} className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4" />
        ) : err ? (
          <ErrorState message={err} onRetry={() => setAttempt((n) => n + 1)} />
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="h3">No results.</p>
            <p className="mt-2 font-mono text-[13px]">Try a different search, price range or collection.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 border-l border-t border-dotted border-fg/50 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p._id} p={p} className="border-b border-r border-dotted border-fg/50" />
              ))}
            </div>
            {shown < products.length && (
              <div className="mt-10 text-center">
                <button
                  className="pill pill-lg"
                  onClick={() => {
                    setShown((s) => s + PAGE);
                    refreshScrollTriggers(300);
                  }}
                >
                  Load more ({products.length - shown} left)
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

// useSearchParams() must sit under a Suspense boundary for static prerendering.
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="wrap pt-44"><ProductGridSkeleton count={8} className="grid-cols-2 xl:grid-cols-4" /></div>}>
      <ShopView />
    </Suspense>
  );
}
