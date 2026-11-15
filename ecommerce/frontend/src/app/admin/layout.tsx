'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Package, ShoppingCart, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo, ThemeToggle } from '../../components/ui/Brand';
import Loading from '../../components/Loading';
import SignInPrompt from '../../components/SignInPrompt';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  if (loading) return <Loading />;
  if (!user) return <SignInPrompt message="Sign in with an admin account to continue." />;
  if (user.role !== 'ADMIN')
    return (
      <div className="wrap-sm flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="eyebrow">403</p>
        <h1 className="h2 mt-4">Admins only</h1>
        <p className="mono mt-4">Your account doesn’t have access to this area.</p>
        <Link href="/" className="pill mt-8">
          Back to store
        </Link>
      </div>
    );

  const on = (n: (typeof NAV)[number]) => (n.exact ? pathname === n.href : pathname.startsWith(n.href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center border-b border-dotted border-fg/30 px-6">
        <Logo />
      </div>
      <p className="eyebrow px-6 pb-2 pt-6">Admin</p>
      <nav aria-label="Admin" className="flex-1 space-y-0.5 px-3">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={on(n) ? 'page' : undefined} className={`flex items-center gap-3 px-3 py-2.5 font-mono text-[13px] transition-colors ${on(n) ? 'bg-accent text-onaccent' : 'text-head hover:bg-fg/10'}`}>
            <n.icon size={16} /> {n.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-3 border-t border-dotted border-fg/30 p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-[14px] text-head">{user.name}</p>
            <p className="truncate font-mono text-[11px]">{user.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex gap-2">
          <Link href="/" className="pill pill-sm flex-1">
            <ExternalLink size={12} /> Store
          </Link>
          <button onClick={logout} className="pill pill-sm flex-1">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-dotted border-fg/30 lg:block">{sidebar}</aside>

      <div className="flex h-[64px] items-center justify-between border-b border-dotted border-fg/30 px-4 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} aria-label="Open admin menu" className="icon-btn">
          <Menu size={17} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] animate-fade-in border-r border-fg/30 bg-bg">
            <button onClick={() => setOpen(false)} aria-label="Close admin menu" className="icon-btn absolute right-3 top-3">
              <X size={16} />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main id="main" className="min-w-0 px-4 pb-16 pt-6 md:px-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
