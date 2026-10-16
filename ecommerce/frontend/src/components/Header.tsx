'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, ShoppingBag, X, User as UIcon, LogOut, Sparkles, LayoutDashboard, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const link = 'hover:text-indigo-600 transition font-semibold';
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/40 shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white text-xs text-center py-1.5 px-4 font-medium">✨ Aman Chaudhary Free delivery on orders over $50 — Cash on Delivery available</div>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 grid place-items-center text-white shadow-lg"><ShoppingBag size={18} /></span>
          <span className="text-xl font-extrabold tracking-tight">Shop<span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Easy</span></span>
        </Link>
        <nav className="hidden md:flex gap-7 text-sm text-slate-600">
          <Link className={link} href="/">Home</Link>
          <Link className={link} href="/products">Products</Link>
          <Link className={link} href="/orders">My Orders</Link>
          {user?.role === 'ADMIN' && <Link className="flex items-center gap-1 text-indigo-700 font-bold" href="/admin"><LayoutDashboard size={15} />Admin</Link>}
        </nav>
        <div className="hidden md:flex items-center gap-2 text-sm">
          <Link href="/cart" className="relative btn-ghost !px-3.5 !py-2"><ShoppingBag size={18} />{count > 0 && <span className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 grid place-items-center px-1">{count}</span>}</Link>
          {user ? (<><span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl"><UIcon size={15} />{user.name}</span><button onClick={logout} className="flex items-center gap-1 text-red-600 font-semibold hover:bg-red-50 px-3 py-2 rounded-xl"><LogOut size={15} /></button></>) : (<><Link href="/login" className="btn-ghost !py-2">Login</Link><Link href="/register" className="btn-primary !py-2">Register</Link></>)}
        </div>
        <button className="md:hidden p-2 border rounded-xl" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1 text-sm font-semibold bg-white border-t">
          <Link className="py-2" href="/">Home</Link><Link className="py-2" href="/products">Products</Link><Link className="py-2" href="/cart">Cart ({count})</Link><Link className="py-2" href="/orders">My Orders</Link>
          {user?.role === 'ADMIN' && <Link className="py-2 text-indigo-700" href="/admin">Admin</Link>}
          {user ? <button onClick={logout} className="text-left text-red-600 py-2">Logout ({user.name})</button> : (<><Link className="py-2" href="/login">Login</Link><Link className="py-2" href="/register">Register</Link></>)}
        </div>
      )}
    </header>
  );
}
