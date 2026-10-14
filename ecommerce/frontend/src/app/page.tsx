'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/products').then((d) => setProducts((d.products||[]).slice(0, 8))).catch(() => {}).finally(() => setLoading(false)); }, []);
  return (<div className="pb-4">
    <section className="relative overflow-hidden rounded-3xl mt-6 bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
      <div className="absolute inset-0 hero-grid opacity-60" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -left-16 w-96 h-96 bg-black/20 blur-3xl rounded-full" />
      <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
        <div>
          <span className="chip bg-white/15 text-white border border-white/20"><Sparkles size={12}/> New collection 2026</span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mt-4">Shop stylish.<br/>Pay on <span className="text-amber-300">delivery.</span></h1>
          <p className="mt-3 text-indigo-100 max-w-md">Handpicked quality products, honest prices and cash on delivery — shopping that feels premium.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/products" className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:-translate-y-0.5 transition shadow-xl">Shop Now <ArrowRight size={17}/></Link>
            <Link href="/products" className="border border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition">Explore categories</Link>
          </div>
          <div className="flex gap-6 mt-7 text-sm">
            {[['10k+','Happy buyers'],['4.9★','Average rating'],['COD','Easy payment']].map((s,k)=>(<div key={k}><p className="text-xl font-extrabold">{s[0]}</p><p className="text-indigo-200">{s[1]}</p></div>))}
          </div>
        </div>
        <div className="hidden md:grid grid-cols-2 gap-4">
          {[['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500','Watches'],['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500','Audio'],['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500','Sneakers'],['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500','Style']].map((c,k)=>(
            <div key={k} className={`rounded-2xl overflow-hidden border border-white/20 shadow-2xl animate-floaty ${k%2?'mt-8':''}`} style={{animationDelay:`${k*0.7}s`}}><img src={c[0]} alt={c[1]} className="h-44 w-full object-cover"/><p className="bg-black/50 backdrop-blur px-3 py-2 text-sm font-bold -mt-9 relative">{c[1]}</p></div>
          ))}
        </div>
      </div>
    </section>
    <section className="grid grid-cols-3 gap-3 mt-5 text-center text-sm">
      {[{i:<Truck size={18}/>,t:'Fast COD'},{i:<ShieldCheck size={18}/>,t:'Quality checked'},{i:<BadgeCheck size={18}/>,t:'Easy returns'}].map((f,k)=>(<div key={k} className="card py-3.5 px-2 flex items-center justify-center gap-2 font-bold text-slate-700"><span className="text-indigo-600">{f.i}</span>{f.t}</div>))}
    </section>
    <div className="flex items-end justify-between mt-10 mb-4"><div><p className="text-xs font-bold uppercase tracking-widest text-fuchsia-600">Handpicked for you</p><h2 className="page-title">Featured Products</h2></div><Link href="/products" className="btn-ghost !py-2 text-sm">View all <ArrowRight size={15}/></Link></div>
    {loading ? <Loading /> : products.length === 0 ? <p className="card p-10 text-center text-slate-500">No products found. Please seed the backend.</p> : (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>)}
  </div>);
}
