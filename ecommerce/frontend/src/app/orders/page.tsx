'use client';
import { useEffect, useState } from 'react';
import { Package, Ban } from 'lucide-react';
import { api } from '../../lib/api';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
const colors: Record<string,string> = { PENDING:'bg-amber-100 text-amber-800', CONFIRMED:'bg-blue-100 text-blue-700', SHIPPED:'bg-violet-100 text-violet-700', DELIVERED:'bg-emerald-100 text-emerald-700', CANCELLED:'bg-red-100 text-red-600' };
export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(true);
  const load = () => api.get('/orders/my').then((d)=>setOrders(d.orders||[])).catch(()=>{}).finally(()=>setLoading(false));
  useEffect(()=>{ if(user) load(); else setLoading(false); },[user]);
  if (!user) return <p className="card mt-8 p-10 text-center">Please <a href="/login" className="text-indigo-600 font-bold">login</a> to view orders.</p>;
  if (loading) return <Loading/>;
  const cancel = async (id:string)=>{ if(!confirm('Cancel this order?')) return; await api.patch(`/orders/${id}/cancel`,{}); load(); };
  return (<div className="py-8">
    <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-600">History</p><h1 className="page-title">My Orders</h1>
    {orders.length===0 ? <div className="card p-10 mt-4 text-center text-slate-500"><Package size={30} className="mx-auto text-indigo-300"/><p className="mt-2 font-semibold">No orders yet. Your stylish finds will appear here.</p></div> : (
    <div className="space-y-3 mt-4">{orders.map((o)=>(<div key={o._id} className="card p-5 text-sm animate-fadeUp">
      <div className="flex flex-wrap justify-between gap-2 items-center"><span className="font-extrabold">#{o.orderNumber}</span><span className={`chip ${colors[o.status]||'bg-slate-100'}`}>{o.status}</span></div>
      <div className="mt-2 divide-y divide-slate-100">{o.items.map((it,i)=><div key={i} className="flex justify-between py-1.5 text-slate-600"><span>{it.name} x {it.quantity}</span><span className="font-semibold text-slate-800">${(it.price*it.quantity).toFixed(2)}</span></div>)}</div>
      <div className="flex flex-wrap justify-between mt-2 pt-2 border-t font-extrabold"><span>Total (COD · {o.paymentStatus})</span><span>${o.total.toFixed(2)}</span></div>
      {(o.status==='PENDING'||o.status==='CONFIRMED') && <button onClick={()=>cancel(o._id)} className="mt-2 text-red-600 text-sm font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg"><Ban size={14}/> Cancel order</button>}
    </div>))}</div>)}
  </div>);
}
