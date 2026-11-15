'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import QtyStepper from '../../components/QtyStepper';
import PageHero from '../../components/PageHero';
import { isPhoto } from '../../components/ProductCard';
import { X } from '../../components/ui/Primitives';

const FREE_FROM = 50;
const FEE = 4.99;

export default function CartPage() {
  const { items, updateQty, remove, subtotal, count } = useCart();

  if (items.length === 0)
    return (
      <div className="wrap-sm flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <p className="eyebrow">Your bag</p>
        <h1 className="h2 mt-4">It’s empty</h1>
        <p className="mono mt-4">Items you add will show up here.</p>
        <Link href="/products" className="pill-accent pill pill-lg mt-8">
          Start shopping <ArrowRight size={16} />
        </Link>
      </div>
    );

  const delivery = subtotal > FREE_FROM ? 0 : FEE;
  const toFree = Math.max(0, FREE_FROM - subtotal);

  return (
    <>
      <PageHero eyebrow={`${count} ${count === 1 ? 'item' : 'items'}`} title="Your bag" />
      <div className="wrap pb-24 pt-10">
        <div className="frame relative grid border-y border-dotted border-fg/50 lg:grid-cols-[1fr_400px]">
          <X at="tl" />
          <X at="tr" />
          <X at="bl" />
          <X at="br" />
          <ul className="divide-y divide-dotted divide-fg/50 lg:border-r lg:border-dotted lg:border-fg/50">
            {items.map((i) => (
              <li key={i.product._id} className="grid grid-cols-[88px_1fr] items-center gap-x-5 gap-y-3 p-5 sm:grid-cols-[112px_1fr_auto] md:p-8">
                <Link href={`/products/${i.product._id}`} className="shot block aspect-square overflow-hidden">
                  <img src={i.product.image} alt={i.product.name} className={`h-full w-full ${isPhoto(i.product.image) ? 'object-cover' : 'object-contain p-2'}`} />
                </Link>
                <div className="min-w-0">
                  <p className="eyebrow">{i.product.brand || i.product.category}</p>
                  <Link href={`/products/${i.product._id}`} className="mt-1 block text-[clamp(1.1rem,2vw,1.5rem)] leading-tight tracking-[-0.015em] text-head hover:text-accentfg">
                    {i.product.name}
                  </Link>
                  <p className="mono mt-1">{formatPrice(i.product.price)} each</p>
                  <button onClick={() => remove(i.product._id)} className="link mt-2 font-mono text-[12px]">
                    Remove
                  </button>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-6 sm:col-span-1 sm:flex-col sm:items-end">
                  <QtyStepper value={i.quantity} min={0} max={i.product.stock} onChange={(q) => updateQty(i.product._id, q)} />
                  <span className="font-mono text-[15px] text-head">{formatPrice(i.product.price * i.quantity)}</span>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit p-6 md:p-8 lg:sticky lg:top-24">
            <p className="eyebrow">Order summary</p>
            <dl className="mt-6 space-y-3 font-mono text-[14px]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-head">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="text-head">{delivery === 0 ? 'Free' : formatPrice(delivery)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-dotted border-fg/50 pt-4">
                <dt className="text-head">Total</dt>
                <dd className="text-[1.8rem] font-medium tracking-[-0.03em] text-head">{formatPrice(subtotal + delivery)}</dd>
              </div>
            </dl>

            <div className="mt-6" aria-live="polite">
              <p className="font-mono text-[12px]">{toFree > 0 ? `Add ${formatPrice(toFree)} more for free delivery.` : 'You’ve unlocked free delivery.'}</p>
              <div className="mt-2 h-[3px] w-full bg-fg/20">
                <div className="h-full bg-accentfg transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / FREE_FROM) * 100)}%` }} />
              </div>
            </div>

            <Link href="/checkout" className="pill-accent pill pill-lg mt-8 w-full">
              Check out <ArrowRight size={16} />
            </Link>
            <p className="mono mt-4 text-center text-[11px]">Pay in cash when your order arrives.</p>
          </aside>
        </div>
      </div>
    </>
  );
}
