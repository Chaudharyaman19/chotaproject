'use client';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Plus, Pencil, Trash2, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { api } from '../../lib/api';
import { Order, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
const empty = { name:'', description:'', price:0, image:'', category:'', stock:0, isActive:true };
export default function Admin() {
  const { user } = useAuth();
  const [orders,setOrders]=useState<Order[]>([]); const [products,setProducts]=useState<Product[]>([]);
  const [rev,setRev]=useState(0); const [total,setTotal]=useState(0); const [form,setForm]=useState(empty); const [editId,setEditId]=useState(''); const [msg,setMsg]=useState('');
  const load = async ()=>{ const o=await api.get('/orders'); setOrders(o.orders||[]); setRev(o.totalRevenue||0); setTotal(o.totalOrders||o.orders?.length||0);
    const p=await api.get('/products/admin/all'); setProducts(p.products||[]); };
  useEffect(()=>{ if(user?.role==='ADMIN') load().catch((e)=>setMsg(e.message)); },[user]);
  if (!user) return <p className="card mt-8 p-10 text-center">Please login.</p>;
  if (user.role!=='ADMIN') return <p className="card mt-8 p-10 text-center text-red-600 font-bold">Admin only.</p>;
  const save = async ()=>{ try{ setMsg(''); const body={...form,price:Number(form.price),stock:Number(form.stock)};
    if(editId) await api.put(`/products/${editId}`,body); else await api.post('/products',body);
    setForm(empty); setEditId(''); setMsg('Saved ✓'); load(); }catch(e:unknown){ setMsg(e instanceof Error?e.message:'Failed'); } };
  const del = async (id:string)=>{ if(!confirm('Delete product?')) return; await api.del(`/products/${id}`); load(); };
  const status = async (id:string,s:string)=>{ await api.patch(`/orders/${id}/status`,{status:s}); load(); };
  return (<div className="py-8 space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-fuchsia-600">Control center</p><h1 className="page-title flex items-center gap-2"><LayoutDashboard size={24} className="text-indigo-600"/> Admin Panel</h1></div>
    {msg && <p className="card p-3 text-sm font-semibold text-indigo-700">{msg}</p>}
    <div className="grid sm:grid-cols-3 gap-3">
      {[['Total orders',String(total),<ShoppingCart size={20}/>],['Revenue (excl. cancelled)','$'+rev.toFixed(2),<DollarSign size={20}/>],['Products',String(products.length),<Package size={20}/>]].map((s,k)=>(<div key={k} className="card p-5 flex items-center gap-3"><span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white grid place-items-center">{s[2]}</span><div><p className="text-xs text-slate-500 font-semibold">{s[0]}</p><p className="text-xl font-extrabold">{s[1]}</p></div></div>))}
    </div>
    <section className="card p-6">
      <h2 className="font-extrabold text-lg flex items-center gap-2"><Plus size={18} className="text-indigo-600"/> {editId?'Edit':'Add'} Product</h2>
      <div className="grid md:grid-cols-3 gap-2 text-sm mt-3">
        <input placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="input"/>
        <input placeholder="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="input"/>
        <input placeholder="Image URL" value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})} className="input"/>
        <input placeholder="Price" type="number" value={form.price} onChange={(e)=>setForm({...form,price:Number(e.target.value)})} className="input"/>
        <input placeholder="Stock" type="number" value={form.stock} onChange={(e)=>setForm({...form,stock:Number(e.target.value)})} className="input"/>
        <input placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="input"/>
      </div>
      <div className="flex gap-2 mt-3"><button onClick={save} className="btn-primary !py-2 text-sm">{editId?'Update':'Add product'}</button>{editId&&<button onClick={()=>{setForm(empty);setEditId('');}} className="btn-ghost !py-2 text-sm">Cancel</button>}</div>
      <div className="mt-4 text-sm max-h-72 overflow-auto divide-y divide-slate-100">
        {products.map((p)=>(<div key={p._id} className="flex justify-between items-center py-2 gap-2"><span className="flex items-center gap-2 min-w-0"><img src={p.image} className="w-9 h-9 rounded-lg object-cover" alt=""/><span className="truncate font-semibold">{p.name} — ${p.price} ({p.stock})</span></span>
          <span className="flex gap-2 shrink-0"><button onClick={()=>{setForm({name:p.name,description:p.description,price:p.price,image:p.image,category:p.category,stock:p.stock,isActive:true});setEditId(p._id);}} className="text-indigo-600 font-bold flex items-center gap-1"><Pencil size={13}/>Edit</button><button onClick={()=>del(p._id)} className="text-red-600 font-bold flex items-center gap-1"><Trash2 size={13}/>Delete</button></span></div>))}
      </div>
    </section>
    <section className="card p-6 text-sm">
      <h2 className="font-extrabold text-lg">All Orders</h2>
      <div className="space-y-1 mt-2">{orders.map((o)=>(<div key={o._id} className="border-b border-slate-100 py-2.5 flex flex-wrap justify-between gap-2 items-center">
        <span><b>#{o.orderNumber}</b> — {o.customerName} — ${o.total.toFixed(2)} — <b>{o.status}</b></span>
        <select value={o.status} onChange={(e)=>status(o._id,e.target.value)} className="input !w-auto !py-1.5">{['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'].map((s)=><option key={s} value={s}>{s}</option>)}</select>
      </div>))}</div>
    </section>
  </div>);
}
