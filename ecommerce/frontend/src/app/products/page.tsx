'use client';
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../../lib/api';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState(''); const [cat, setCat] = useState(''); const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true); const [err, setErr] = useState('');
  const load = async () => { setLoading(true); setErr('');
    try { const q = new URLSearchParams(); if (search) q.set('search', search); if (cat) q.set('category', cat); if (sort) q.set('sort', sort);
      const d = await api.get(`/products?${q.toString()}`); setProducts(d.products||[]); setCategories(d.categories||[]);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Failed'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  return (<div className="py-8">
    <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-600">Catalog</p><h1 className="page-title">All Products</h1>
    <div className="card p-4 mt-4 flex flex-wrap gap-2 items-center">
      <label className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-3"><Search size={16} className="text-slate-400"/><input value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&load()} placeholder="Search products..." className="bg-transparent outline-none py-2.5 text-sm w-full"/></label>
      <select value={cat} onChange={(e)=>setCat(e.target.value)} className="input !w-auto"><option value="">All categories</option>{categories.map((c)=><option key={c} value={c}>{c}</option>)}</select>
      <select value={sort} onChange={(e)=>setSort(e.target.value)} className="input !w-auto"><option value="">Default sort</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select>
      <button onClick={load} className="btn-primary !py-2.5 text-sm"><SlidersHorizontal size={15}/> Apply</button>
    </div>
    <div className="mt-5">{loading ? <Loading/> : err ? <p className="card p-8 text-center text-red-600">{err}</p> : products.length===0 ? <p className="card p-10 text-center text-slate-500">No products found. Try another search.</p> : (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">{products.map((p)=><ProductCard key={p._id} p={p}/>)}</div>)}</div>
  </div>);
}
