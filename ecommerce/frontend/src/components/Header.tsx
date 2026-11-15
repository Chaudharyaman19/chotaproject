'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Logo, ThemeToggle } from './ui/Brand';
import SearchPanel from './SearchPanel';

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  const [account, setAccount] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const accountRef = useRef<HTMLDivElement>(null);
  const closeSearch = useCallback(() => setSearching(false), []);

  useEffect(() => {
    api
      .get('/products?limit=1')
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Close every flyout on navigation.
  useEffect(() => {
    setMenu(false);
    setSearching(false);
    setAccount(false);
    setShopOpen(false);
  }, [pathname]);

  // Freeze the page behind full-screen overlays (Lenis listens for this class).
  useEffect(() => {
    const lock = menu || searching;
    document.documentElement.classList.toggle('lenis-stopped', lock);
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.documentElement.classList.remove('lenis-stopped');
      document.body.style.overflow = '';
    };
  }, [menu, searching]);

  useEffect(() => {
    if (!account) return;
    const onDown = (e: MouseEvent) => !accountRef.current?.contains(e.target as Node) && setAccount(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAccount(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [account]);

  const links = [
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
    ...(user ? [{ href: '/orders', label: 'Orders' }] : []),
  ];
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const navLink = (on: boolean) => `font-mono text-[13px] tracking-[0.03em] transition-colors ${on ? 'text-accentfg' : 'text-head hover:text-accentfg'}`;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${scrolled || menu || pathname !== '/' ? 'border-b border-dotted border-fg/30 bg-bg/80 backdrop-blur-md' : 'border-b border-transparent'}`}>
        <nav aria-label="Main" className="relative mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between px-5 md:px-10">
          <Logo />

          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
            <li className="relative flex h-[72px] items-center" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
              <Link href="/products" className={`${navLink(active('/products'))} inline-flex items-center gap-1.5`} aria-haspopup="true" aria-expanded={shopOpen}>
                Shop
                <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`}>
                  <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </Link>
              {shopOpen && (
                <div className="absolute left-1/2 top-full w-[520px] -translate-x-1/2 animate-fade-in border border-dotted border-fg/40 bg-bg p-6 shadow-2xl">
                  <p className="eyebrow mb-4">Collections</p>
                  <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
                    <li className="col-span-2">
                      <Link href="/products" className="group flex items-center justify-between border-b border-dotted border-fg/30 py-2.5 text-head">
                        <span className="text-[17px] tracking-[-0.01em]">All products</span>
                        <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                    {categories.map((c) => (
                      <li key={c}>
                        <Link href={`/products?category=${encodeURIComponent(c)}`} className="group flex items-center justify-between border-b border-dotted border-fg/30 py-2.5 text-head">
                          <span className="text-[17px] tracking-[-0.01em]">{c}</span>
                          <ArrowUpRight size={15} className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
            {links.map((l) => (
              <li key={l.href} className="flex h-[72px] items-center">
                <Link href={l.href} className={navLink(active(l.href))} aria-current={active(l.href) ? 'page' : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button aria-label={searching ? 'Close search' : 'Search'} aria-expanded={searching} onClick={() => { setSearching((s) => !s); setMenu(false); }} className="icon-btn">
              {searching ? <X size={16} /> : <Search size={16} />}
            </button>
            <ThemeToggle />
            <Link href="/cart" aria-label={`Bag, ${count} items`} className="pill pill-sm relative !h-10">
              <ShoppingBag size={14} /> <span className="hidden sm:inline">Bag</span>
              <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] leading-none ${count ? 'bg-accent text-onaccent' : 'bg-fg/20 text-head'}`}>{count}</span>
            </Link>

            <div ref={accountRef} className="relative hidden md:block">
              {user ? (
                <>
                  <button aria-label="Account menu" aria-expanded={account} onClick={() => setAccount((a) => !a)} className="grid h-10 w-10 place-items-center rounded-full bg-accent font-mono text-[13px] font-medium text-onaccent">
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                  {account && (
                    <div className="absolute right-0 top-12 w-64 animate-fade-in border border-dotted border-fg/40 bg-bg text-[14px] shadow-2xl">
                      <div className="border-b border-dotted border-fg/30 px-4 py-3">
                        <p className="truncate text-head">{user.name}</p>
                        <p className="truncate font-mono text-[12px]">{user.email}</p>
                      </div>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-fg/10">
                        <Package size={15} /> Orders
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-fg/10">
                          <LayoutDashboard size={15} /> Admin panel
                        </Link>
                      )}
                      <button onClick={logout} className="flex w-full items-center gap-3 border-t border-dotted border-fg/30 px-4 py-2.5 text-left hover:bg-fg/10">
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" className="pill pill-sm !h-10">
                  Sign in
                </Link>
              )}
            </div>
            {!user && (
              <Link href="/products" className="pill-accent pill pill-sm !h-10 hidden xl:inline-flex">
                Shop now
              </Link>
            )}
            <button aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => { setMenu((m) => !m); setSearching(false); }} className="icon-btn lg:hidden">
              {menu ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
      </header>

      {searching && (
        <>
          <div onClick={closeSearch} className="fixed inset-0 top-[72px] z-[54] animate-fade-in bg-black/50 backdrop-blur-sm" aria-hidden />
          <SearchPanel onClose={closeSearch} />
        </>
      )}

      {menu && (
        <div id="mobile-menu" data-lenis-prevent className="fixed inset-x-0 bottom-0 top-[72px] z-[55] animate-fade-in overflow-y-auto bg-bg px-5 pb-10 pt-4 lg:hidden">
          <ul>
            {[{ href: '/products', label: 'Shop' }, ...links, ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : [])].map((l) => (
              <li key={l.href} className="border-b border-dotted border-fg/40">
                <Link href={l.href} className="block py-4 text-[2.4rem] font-medium uppercase leading-none tracking-[-0.04em] text-head">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {user ? (
              <button onClick={logout} className="pill">
                Sign out ({user.name.split(' ')[0]})
              </button>
            ) : (
              <>
                <Link href="/login" className="pill">
                  Sign in
                </Link>
                <Link href="/register" className="pill-accent pill">
                  Create account
                </Link>
              </>
            )}
          </div>
          {categories.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow mb-3">Collections</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c} href={`/products?category=${encodeURIComponent(c)}`} className="pill pill-sm">
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
