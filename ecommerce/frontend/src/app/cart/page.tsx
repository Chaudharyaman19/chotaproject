'use client';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/format';
import QtyStepper from '../../components/QtyStepper';

export default function CartPage() {
  const { items, updateQty, remove, subtotal, count } = useCart();

  if (items.length === 0)
    return (
      <div className="wrap-sm py-16 text-center">
        <h1 className="h-page">Your bag is empty</h1>
        <p className="mt-1 text-[13px] text-mute">Items you add will show up here.</p>
        <Link href="/products" className="btn-primary mt-5">
          Continue shopping
        </Link>
      </div>
    );

  const delivery = subtotal > 50 ? 0 : 4.99;

  return (
    <div className="wrap py-5">
      <h1 className="h-page">
        Your bag <span className="font-normal text-mute">· {count} {count === 1 ? 'item' : 'items'}</span>
      </h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((i) => (
            <li key={i.product._id} className="flex items-center gap-3 py-3">
              <Link href={`/products/${i.product._id}`} className="shrink-0">
                <img src={i.product.image} alt={i.product.name} className="h-14 w-14 rounded-md border border-line bg-canvas object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${i.product._id}`} className="block truncate text-[13px] font-medium hover:underline">
                  {i.product.name}
                </Link>
                <p className="text-xs text-mute">{formatPrice(i.product.price)} each</p>
                <button onClick={() => remove(i.product._id)} className="link mt-0.5 text-xs text-mute">
                  Remove
                </button>
              </div>
              <QtyStepper value={i.quantity} min={0} max={i.product.stock} onChange={(q) => updateQty(i.product._id, q)} />
              <span className="w-16 text-right text-[13px] font-medium tabular-nums">{formatPrice(i.product.price * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-line p-4 lg:sticky lg:top-16">
          <h2 className="h-section">Order summary</h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Delivery</dt>
              <dd>{delivery === 0 ? 'Free' : formatPrice(delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(subtotal + delivery)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn-primary mt-4 w-full">
            Check out
          </Link>
          <p className="mt-2 text-center text-[11px] text-mute">Pay in cash when your order arrives.</p>
        </aside>
      </div>
    </div>
  );
}
