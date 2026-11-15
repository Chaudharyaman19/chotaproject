'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchPanel from './SearchPanel';

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  const [account, setAccount] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const closeSearch = useCallback(() => setSearching(false), []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/orders', label: 'Orders' },
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Close every flyout when the route changes.
  useEffect(() => {
    setMenu(false);
    setSearching(false);
    setAccount(false);
  }, [pathname]);

  // Don't let the page scroll behind a full-screen menu / search.
  useEffect(() => {
    document.body.style.overflow = menu || searching ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu, searching]);

  // Account dropdown: close on outside click or Escape.
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

  const iconBtn = 'relative grid h-11 w-8 place-items-center text-ink/70 transition hover:text-ink';
  const menuItem = 'flex items-center gap-2.5 px-3 py-2 hover:bg-canvas';

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
        <nav aria-label="Main" className="wrap flex h-11 items-center justify-between">
          <Link href="/" className="text-[15px] font-semibold tracking-tight" aria-label="ShopEasy home">
            ShopEasy
          </Link>

          <ul className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`text-[13px] transition ${isActive(l.href) ? 'font-medium text-ink' : 'text-mute hover:text-ink'}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center">
            <button aria-label={searching ? 'Close search' : 'Search'} aria-expanded={searching} onClick={() => { setSearching((s) => !s); setMenu(false); }} className={iconBtn}>
              {searching ? <X size={16} /> : <Search size={16} />}
            </button>

            <Link href="/cart" aria-label={`Bag, ${count} items`} className={iconBtn}>
              <ShoppingBag size={16} />
              {count > 0 && (
                <span className="absolute right-[-2px] top-2 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-none text-white">
                  {count}
                </span>
              )}
            </Link>

            {/* Account: sign-in link when logged out, dropdown when logged in */}
            <div ref={accountRef} className="relative hidden md:block">
              {user ? (
                <>
                  <button aria-label="Account menu" aria-expanded={account} onClick={() => setAccount((a) => !a)} className={iconBtn}>
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </button>
                  {account && (
                    <div className="absolute right-0 top-10 w-52 animate-fade-in overflow-hidden rounded-lg border border-line bg-white text-[13px]">
                      <div className="border-b border-line px-3 py-2">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-xs text-mute">{user.email}</p>
                      </div>
                      <Link href="/orders" className={menuItem}>
                        <Package size={14} className="text-mute" /> Orders
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" className={menuItem}>
                          <LayoutDashboard size={14} className="text-mute" /> Admin
                        </Link>
                      )}
                      <button onClick={logout} className={`${menuItem} w-full border-t border-line text-left`}>
                        <LogOut size={14} className="text-mute" /> Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" aria-label="Sign in" className={iconBtn}>
                  <UserIcon size={16} />
                </Link>
              )}
            </div>

            <button aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => { setMenu((m) => !m); setSearching(false); }} className={`${iconBtn} md:hidden`}>
              {menu ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Overlays are siblings of <header>: backdrop-filter would otherwise trap `position: fixed` children. */}
      {searching && (
        <>
          <div onClick={closeSearch} className="fixed inset-0 top-11 z-[54] animate-fade-in bg-black/20" aria-hidden />
          <SearchPanel onClose={closeSearch} />
        </>
      )}

      {menu && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-11 z-[55] animate-fade-in overflow-y-auto bg-white px-4 pb-8 pt-2 md:hidden">
          <ul>
            {links.map((l) => (
              <li key={l.href} className="border-b border-line">
                <Link href={l.href} className="block py-3 text-base font-medium">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            {user ? (
              <>
                <p className="text-xs text-mute">Signed in as</p>
                <p className="text-sm font-medium">{user.name}</p>
                <button onClick={logout} className="btn-secondary mt-3">
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="btn-primary">
                  Sign in
                </Link>
                <Link href="/register" className="link link-more text-[13px]">
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Promotional strip below the nav (kept from the original banner copy) */}
      <div className="border-b border-line bg-canvas px-4 py-1.5 text-center text-[11px] text-mute">
        Aman Chaudhary Free delivery on orders over $50 — Cash on Delivery available
        <Link href="/products" className="link link-more ml-2 font-medium">
          Shop now
        </Link>
      </div>
    </>
  );
}
