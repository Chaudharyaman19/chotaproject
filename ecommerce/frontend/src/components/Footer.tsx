import Link from 'next/link';
import { ShoppingBag, Truck, ShieldCheck, Headset } from 'lucide-react';
export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-3 gap-4 mb-8">
        {[{i:<Truck size={20}/>,t:'Fast COD Delivery',d:'Pay cash at your doorstep'},{i:<ShieldCheck size={20}/>,t:'Trusted Quality',d:'Checked before shipping'},{i:<Headset size={20}/>,t:'Friendly Support',d:'7 days a week help'}].map((f,k)=>(
          <div key={k} className="card p-5 flex gap-3 items-start"><span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">{f.i}</span><div><p className="font-bold">{f.t}</p><p className="text-sm text-slate-500">{f.d}</p></div></div>
        ))}
      </div>
      <div className="bg-slate-950 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div><p className="flex items-center gap-2 text-white font-extrabold text-lg"><span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center"><ShoppingBag size={16}/></span>ShopEasy</p><p className="mt-2 text-slate-400">Modern, simple & stylish shopping with Cash on Delivery.</p></div>
          <div><p className="text-white font-bold mb-2">Shop</p><div className="flex flex-col gap-1.5"><Link href="/products">All Products</Link><Link href="/cart">Cart</Link><Link href="/orders">My Orders</Link></div></div>
          <div><p className="text-white font-bold mb-2">Account</p><div className="flex flex-col gap-1.5"><Link href="/login">Login</Link><Link href="/register">Register</Link><Link href="/admin">Admin Panel</Link></div></div>
        </div>
        <div className="border-t border-white/10 text-center text-xs py-4 text-slate-500">© 2026 ShopEasy — Cash on Delivery. All rights reserved.</div>
      </div>
    </footer>
  );
}
