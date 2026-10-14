'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface Ctx {
  items: CartItem[]; add: (p: Product, q?: number) => void;
  updateQty: (id: string, q: number) => void; remove: (id: string) => void;
  clear: () => void; subtotal: number; count: number;
}
const C = createContext<Ctx>({ items: [], add: () => {}, updateQty: () => {}, remove: () => {}, clear: () => {}, subtotal: 0, count: 0 });

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('cart') || '[]')); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)); }, [items]);
  useEffect(() => {
    const sync = () => { try { setItems(JSON.parse(localStorage.getItem('cart') || '[]')); } catch {} };
    window.addEventListener('auth-change', sync);
    return () => window.removeEventListener('auth-change', sync);
  }, []);
  const add = (p: Product, q = 1) =>
    setItems((prev) => {
      const f = prev.find((i) => i.product._id === p._id);
      if (f) return prev.map((i) => i.product._id === p._id ? { ...i, quantity: Math.min(i.quantity + q, p.stock) } : i);
      return [...prev, { product: p, quantity: Math.min(q, p.stock) }];
    });
  const updateQty = (id: string, q: number) =>
    setItems((prev) => q <= 0 ? prev.filter((i) => i.product._id !== id) : prev.map((i) => i.product._id === id ? { ...i, quantity: q } : i));
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.product._id !== id));
  const clear = () => setItems([]);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return <C.Provider value={{ items, add, updateQty, remove, clear, subtotal, count }}>{children}</C.Provider>;
}
export const useCart = () => useContext(C);
