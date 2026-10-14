'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, CheckCircle2, MapPin, Phone, User } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ customerName: '', phone: '', shippingAddress: '' });
  const [err, setErr] = useState(''); const [done, setDone] = useState(''); const [busy, setBusy] = useState(false);
  if (!user) return <p className="card mt-8 p-10 text-center">Please <a href="/login" className="text-indigo-600 font-bold">login</a> to checkout.</p>;
  const place = async () => { setErr(''); setBusy(true);
    try { const order = await api.post('/orders', { ...form, items: items.map((i)=>({ productId: i.product._id, quantity: i.quantity })) });
      clear(); setDone(`Order ${order.orderNumber} placed! COD — please keep $${order.total.toFixed(2)} ready.`);
      setTimeout(()=>router.push('/orders'), 2200);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Failed'); } finally { setBusy(false); } };
  return (<div className="py-8 max-w-3xl mx-auto">
    <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-600">Almost done</p><h1 className="page-title">Checkout — Cash on Delivery</h1>
    {done ? <p className="card p-8 mt-5 text-center text-emerald-700 font-bold flex flex-col items-center gap-2"><CheckCircle2 size={36}/> {done}</p> : (
    <div className="grid md:grid-cols-2 gap-4 mt-5">
      <div className="card p-6 space-y-3">
        <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3"><User size={15} className="text-slate-400"/><input placeholder="Full name" value={form.customerName} onChange={(e)=>setForm({...form,customerName:e.target.value})} className="bg-transparent outline-none py-2.5 text-sm w-full"/></label>
        <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3"><Phone size={15} className="text-slate-400"/><input placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} className="bg-transparent outline-none py-2.5 text-sm w-full"/></label>
        <label className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3"><MapPin size={15} className="text-slate-400 mt-3"/><textarea placeholder="Shipping address" rows={4} value={form.shippingAddress} onChange={(e)=>setForm({...form,shippingAddress:e.target.value})} className="bg-transparent outline-none py-2.5 text-sm w-full"/></label>
      </div>
      <div className="card p-6 text-sm h-fit">
        {items.map((i)=><div key={i.product._id} className="flex justify-between py-1 text-slate-600"><span>{i.product.name} x {i.quantity}</span><span className="font-semibold text-slate-800">${(i.product.price*i.quantity).toFixed(2)}</span></div>)}
        <div className="font-extrabold flex justify-between mt-3 pt-3 border-t text-base"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
        <p className="flex items-center gap-2 mt-2 bg-amber-50 text-amber-800 font-semibold px-3 py-2 rounded-xl"><Banknote size={16}/> Cash on Delivery (UNPAID)</p>
        {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
        <button onClick={place} disabled={items.length===0||busy} className="btn-primary w-full mt-3 disabled:opacity-40">{busy?'Placing order...':'Place Order'}</button>
      </div>
    </div>)}
  </div>);
}
