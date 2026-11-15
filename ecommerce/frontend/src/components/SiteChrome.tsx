'use client';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

/** Storefront header/footer around every page except the admin panel, which has its own shell. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
