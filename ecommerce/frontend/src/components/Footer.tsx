import Link from 'next/link';
import Newsletter from './Newsletter';
import { Logo } from './ui/Brand';
import { X } from './ui/Primitives';

const columns: { title: string; links: [string, string][] }[] = [
  { title: 'Shop', links: [['/products', 'All products'], ['/products?sort=newest', 'New arrivals'], ['/products?featured=true', 'Featured'], ['/cart', 'Your bag']] },
  { title: 'Company', links: [['/about', 'About us'], ['/contact', 'Contact'], ['/faq', 'FAQ'], ['/shipping', 'Shipping & returns']] },
  { title: 'Account', links: [['/login', 'Sign in'], ['/register', 'Create account'], ['/orders', 'Your orders']] },
  { title: 'Legal', links: [['/privacy', 'Privacy policy'], ['/terms', 'Terms of service']] },
];

export default function Footer() {
  return (
    <footer className="tone-ink relative bg-bg text-fg">
      <div className="wrap">
        <div className="frame relative grid gap-0 border-y border-dotted border-fg/50 md:grid-cols-[1.2fr_1fr]">
          <X at="tl" />
          <X at="tr" />
          <X at="bl" />
          <X at="br" />
          <div className="border-b border-dotted border-fg/50 p-6 md:border-b-0 md:border-r md:p-10">
            <Logo />
            <p className="mt-5 max-w-sm font-mono text-[13px] leading-6">Everyday objects, chosen with care and delivered to your door. Pay in cash when it arrives.</p>
            <div className="mt-8 max-w-md">
              <p className="eyebrow mb-3">Join the list</p>
              <Newsletter />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 p-6 sm:grid-cols-4 md:grid-cols-2 md:p-10 lg:grid-cols-4">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="eyebrow mb-4">{c.title}</p>
                <ul className="space-y-2.5">
                  {c.links.map(([href, label]) => (
                    <li key={label}>
                      <Link href={href} className="text-[15px] text-head transition-colors hover:text-accentfg">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden py-6 md:py-10" aria-hidden>
          <p className="select-none text-center font-medium uppercase leading-[0.8] tracking-[-0.06em] text-head/90" style={{ fontSize: 'clamp(4rem, 19.5vw, 19rem)' }}>
            shopeasy
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-dotted border-fg/50 py-5 font-mono text-[12px] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ShopEasy. All rights reserved.</p>
          <p>Cash on delivery · Free delivery over $50</p>
        </div>
      </div>
    </footer>
  );
}
