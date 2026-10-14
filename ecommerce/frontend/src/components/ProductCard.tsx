'use client';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  return (
    <div className="card overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fadeUp">
      <Link href={`/products/${p._id}`} className="relative overflow-hidden">
        <img src={p.image} alt={p.name} loading="lazy" className="h-52 w-full object-cover group-hover:scale-105 transition duration-500" />
        <span className="absolute top-3 left-3 chip bg-white/90 text-indigo-700 shadow">{p.category}</span>
        {p.stock <= 5 && p.stock > 0 && <span className="absolute top-3 right-3 chip bg-amber-400 text-amber-950">Only {p.stock} left</span>}
        {p.stock === 0 && <span className="absolute top-3 right-3 chip bg-red-500 text-white">Sold out</span>}
      </Link>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <span className="flex items-center gap-1 text-xs text-amber-500 font-bold"><Star size={13} fill="currentColor"/>4.8 <span className="text-slate-400 font-medium">(120+)</span></span>
        <Link href={`/products/${p._id}`} className="font-bold leading-snug hover:text-indigo-600 line-clamp-1">{p.name}</Link>
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold">${p.price.toFixed(2)}</span>
          <span className={`text-xs font-semibold ${p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{p.stock > 0 ? `● In stock` : '● Out of stock'}</span>
        </div>
        <button disabled={p.stock === 0} onClick={() => add(p)} className="btn-primary mt-2 !py-2 text-sm disabled:opacity-40 disabled:pointer-events-none"><ShoppingCart size={16} /> Add to Cart</button>
      </div>
    </div>
  );
}
