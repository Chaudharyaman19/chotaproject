import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
export const metadata: Metadata = { title: 'ShopEasy — Stylish Online Shopping', description: 'Modern e-commerce with Cash on Delivery' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen flex flex-col"><AuthProvider><CartProvider><Header /><main className="flex-1 max-w-7xl w-full mx-auto px-4">{children}</main><Footer /></CartProvider></AuthProvider></body></html>);
}
