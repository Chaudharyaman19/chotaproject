'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
export default function Register() {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false);
  const { register } = useAuth(); const router = useRouter();
  const go = async ()=>{ try{ setErr(''); setBusy(true); await register(name,email,password); router.push('/'); }catch(e:unknown){ setErr(e instanceof Error?e.message:'Failed'); }finally{ setBusy(false); } };
  return (<div className="py-12 max-w-md mx-auto"><div className="card p-8">
    <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 grid place-items-center text-white"><ShoppingBag size={22}/></span>
    <h1 className="page-title mt-3">Create account</h1><p className="text-sm text-slate-500">Join ShopEasy in 30 seconds.</p>
    <input placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} className="input mt-4"/>
    <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="input mt-2"/>
    <input placeholder="Password (min 6)" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&go()} className="input mt-2"/>
    {err && <p className="text-red-600 text-sm mt-2 bg-red-50 p-2.5 rounded-xl">{err}</p>}
    <button onClick={go} disabled={busy} className="btn-primary w-full mt-4 disabled:opacity-50"><UserPlus size={16}/> {busy?'Creating...':'Register'}</button>
    <p className="text-sm mt-3 text-center">Have account? <Link href="/login" className="text-indigo-600 font-bold">Login</Link></p>
  </div></div>);
}
