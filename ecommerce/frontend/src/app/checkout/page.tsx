'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextAreaField } from '../../components/Field';
import SignInPrompt from '../../components/SignInPrompt';
import Loading from '../../components/Loading';

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ customerName: '', phone: '', shippingAddress: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ number: string; total: number } | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (!user) return <SignInPrompt message="Please sign in to check out." />;

  // Mirrors the server's validation so the button only enables for acceptable input.
  const valid = form.customerName.trim().length >= 2 && form.phone.trim().length >= 7 && form.shippingAddress.trim().length >= 5;

  const place = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setErr('');
    setBusy(true);
    try {
      const order = await api.post('/orders', { ...form, items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })) });
      clear();
      setDone({ number: order.orderNumber, total: order.total });
      setTimeout(() => router.push('/orders'), 2600);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="wrap-sm py-16 text-center">
        <span className="mx-auto grid h-10 w-10 animate-pop place-items-center rounded-full bg-[#1d7a36] text-white">
          <Check size={20} strokeWidth={2.5} />
        </span>
        <h1 className="h-page mt-4">Thank you. Your order is in.</h1>
        <p className="mt-1 text-[13px] text-mute">
          Order <span className="font-semibold text-ink">#{done.number}</span>. Please keep {formatPrice(done.total)} ready for delivery.
        </p>
        <Link href="/orders" className="link link-more mt-3 inline-block text-[13px]">
          View your orders
        </Link>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="wrap-sm py-16 text-center">
        <h1 className="h-page">Your bag is empty</h1>
        <Link href="/products" className="btn-primary mt-5">
          Continue shopping
        </Link>
      </div>
    );

  return (
    <div className="wrap py-5">
      <h1 className="h-page">Check out</h1>

      <form onSubmit={place} className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section>
            <h2 className="h-section">Delivery details</h2>
            <div className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="name" label="Full name" autoComplete="name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                <Field id="phone" label="Phone number" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <TextAreaField id="address" label="Shipping address" rows={3} autoComplete="street-address" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
            </div>
          </section>

          <section>
            <h2 className="h-section">Payment</h2>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-ink px-3 py-2.5">
              <div>
                <p className="text-[13px] font-medium">Cash on delivery</p>
                <p className="text-xs text-mute">Pay in cash when your order arrives.</p>
              </div>
              <span className="grid h-4 w-4 place-items-center rounded-full bg-ink text-white">
                <Check size={10} strokeWidth={3} />
              </span>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-line p-4 lg:sticky lg:top-16">
          <h2 className="h-section">Order summary</h2>
          <ul className="mt-3 space-y-2">
            {items.map((i) => (
              <li key={i.product._id} className="flex items-center gap-2.5 text-[13px]">
                <img src={i.product.image} alt="" className="h-9 w-9 rounded-md border border-line bg-canvas object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{i.product.name}</span>
                  <span className="text-[11px] text-mute">Qty {i.quantity}</span>
                </span>
                <span className="tabular-nums">{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-line pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {err && (
            <p role="alert" className="mt-3 rounded-md bg-[#fff1f0] px-3 py-2 text-xs text-[#c4271b]">
              {err}
            </p>
          )}

          <button type="submit" disabled={!valid || busy} className="btn-primary mt-4 w-full">
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  );
}
