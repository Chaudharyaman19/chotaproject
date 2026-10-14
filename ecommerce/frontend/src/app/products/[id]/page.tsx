'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Truck, ShieldCheck, Minus, Plus, Star, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';
import Loading from '../../../components/Loading';
export default function Detail() {
  const { id } = useParams() as { id: string };
  const [p, setP] = useState<Product|null>(null); const [loading, setLoading] = useState(true); const [qty, setQty] = useState(1);
  const { add } = useCart();
  useEffect(()=>{ api.get(`/products/${id}`).then(setP).catch(()=>{}).finally(()=>setLoading(false)); },[id]);
  if (loading) return <Loading/>;
  if (!p) return <p className="py-16 text-center card mt-8">Product not found. <Link href="/products" className="text-indigo-600 font-bold">Go back</Link></p>;
  return (<div className="py-8">
    <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600"><ArrowLeft size={15}/> Back to products</Link>
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <div className="card overflow-hidden"><img src={p.image} alt={p.name} className="w-full h-[420px] object-cover"/></div>
      <div className="card p-6 md:p-8">
        <span className="chip bg-indigo-50 text-indigo-700">{p.category}</span>
        <h1 className="text-3xl font-extrabold mt-2">{p.name}</h1>
        <p className="flex items-center gap-1 text-sm text-amber-500 font-bold mt-1"><Star size={14} fill="currentColor"/> 4.8 <span className="text-slate-400 font-medium">· 120+ reviews</span></p>
        <p className="text-3xl font-extrabold mt-3">${p.price.toFixed(2)} <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full ml-1">COD available</span></p>
        <p className="text-slate-600 mt-3 leading-relaxed">{p.description}</p>
        <p className={`mt-3 text-sm font-bold ${p.stock>0?'text-emerald-600':'text-red-500'}`}>{p.stock>0?`● In stock (${p.stock} available)`:'● Out of stock'}</p>
        <div className="flex items-center gap-3 mt-5">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden"><button onClick={()=>setQty(Math.max(1,qty-1))} className="px-3.5 py-2.5 hover:bg-slate-50"><Minus size={15}/></button><span className="w-10 text-center font-bold">{qty}</span><button onClick={()=>setQty(Math.min(p.stock,qty+1))} className="px-3.5 py-2.5 hover:bg-slate-50"><Plus size={15}/></button></div>
          <button disabled={p.stock===0} onClick={()=>add(p,qty)} className="btn-primary flex-1 disabled:opacity-40"><ShoppingCart size={17}/> Add to Cart</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-5 text-sm"><span className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 font-semibold"><Truck size={16} className="text-indigo-600"/> Fast delivery</span><span className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 font-semibold"><ShieldCheck size={16} className="text-indigo-600"/> Quality checked</span></div>
      </div>
    </div>
  </div>);
}
