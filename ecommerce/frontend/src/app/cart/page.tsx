'use client';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
export default function CartPage() {
  const { items, updateQty, remove, subtotal } = useCart();
  if (items.length===0) return <div className="py-16 text-center card mt-8 p-10"><span className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center mx-auto"><ShoppingBag size={24}/></span><h1 className="page-title mt-3">Your cart is empty</h1><p className="text-slate-500 text-sm mt-1">Add some stylish products first.</p><Link href="/products" className="btn-primary mt-5">Browse products <ArrowRight size={16}/></Link></div>;
  return (<div className="py-8 grid lg:grid-cols-3 gap-5">
    <div className="lg:col-span-2 space-y-3"><h1 className="page-title">Shopping Cart ({items.length})</h1>
      {items.map((i)=>(<div key={i.product._id} className="card p-3.5 flex gap-4 items-center animate-fadeUp">
        <img src={i.product.image} alt={i.product.name} className="w-20 h-20 object-cover rounded-xl"/>
        <div className="flex-1 min-w-0"><p className="font-bold truncate">{i.product.name}</p><p className="text-sm text-slate-500">${i.product.price.toFixed(2)} each</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center border border-slate-200 rounded-lg overflow-hidden"><button onClick={()=>updateQty(i.product._id,i.quantity-1)} className="px-2.5 py-1 hover:bg-slate-50"><Minus size={13}/></button><span className="w-8 text-center text-sm font-bold">{i.quantity}</span><button onClick={()=>updateQty(i.product._id,i.quantity+1)} className="px-2.5 py-1 hover:bg-slate-50"><Plus size={13}/></button></span>
            <button onClick={()=>remove(i.product._id)} className="text-red-500 text-sm font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg"><Trash2 size={14}/> Remove</button>
          </div></div>
        <span className="font-extrabold">${(i.product.price*i.quantity).toFixed(2)}</span>
      </div>))}
    </div>
    <div className="card p-6 h-fit lg:sticky lg:top-32"><h2 className="font-extrabold text-lg">Order summary</h2><div className="flex justify-between text-sm mt-3"><span className="text-slate-500">Subtotal</span><b>${subtotal.toFixed(2)}</b></div><div className="flex justify-between text-sm mt-1"><span className="text-slate-500">Delivery</span><b className="text-emerald-600">{subtotal>50?'FREE':'$4.99'}</b></div><div className="border-t mt-3 pt-3 flex justify-between font-extrabold text-lg"><span>Total</span><span>${(subtotal+(subtotal>50?0:4.99)).toFixed(2)}</span></div><Link href="/checkout" className="btn-primary w-full mt-4">Checkout <ArrowRight size={16}/></Link><Link href="/products" className="btn-ghost w-full mt-2 text-sm">Continue shopping</Link></div>
  </div>);
}
