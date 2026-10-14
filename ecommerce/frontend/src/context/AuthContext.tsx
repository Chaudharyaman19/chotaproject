'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import { User } from '../types';

interface Ctx { user: User | null; loading: boolean; login: (e: string, p: string) => Promise<void>; register: (n: string, e: string, p: string) => Promise<void>; logout: () => void; }
const C = createContext<Ctx>({ user: null, loading: true, login: async () => {}, register: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { setLoading(false); return; }
    api.get('/auth/me').then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);
  const login = async (email: string, password: string) => {
    const d = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', d.token); setUser(d.user);
    window.dispatchEvent(new Event('auth-change'));
  };
  const register = async (name: string, email: string, password: string) => {
    const d = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', d.token); setUser(d.user);
    window.dispatchEvent(new Event('auth-change'));
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); window.dispatchEvent(new Event('auth-change')); };
  return <C.Provider value={{ user, loading, login, register, logout }}>{children}</C.Provider>;
}
export const useAuth = () => useContext(C);
