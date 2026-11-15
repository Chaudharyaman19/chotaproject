'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Field, TextAreaField } from '../../components/ui/Field';
import SignInPrompt from '../../components/SignInPrompt';
import Loading from '../../components/Loading';
import PageHero from '../../components/PageHero';
import { isPhoto } from '../../components/ProductCard';
import { X } from '../../components/ui/Primitives';

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

  const delivery = subtotal > 50 ? 0 : 4.99;
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
      setTimeout(() => router.push('/orders'), 3200);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="wrap-sm flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <span className="grid h-16 w-16 animate-fade-up place-items-center rounded-full bg-accent text-onaccent">
          <Check size={30} strokeWidth={2.4} />
        </span>
        <h1 className="h2 mt-8">Order placed</h1>
        <p className="mono mt-4">
          Order <span className="text-head">#{done.number}</span>. Please keep {formatPrice(done.total)} ready for delivery.
        </p>
        <Link href="/orders" className="pill mt-8">
          View your orders
        </Link>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="wrap-sm flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <h1 className="h2">Your bag is empty</h1>
        <Link href="/products" className="pill-accent pill pill-lg mt-8">
          Continue shopping
        </Link>
      </div>
    );

  return (
    <>
      <PageHero eyebrow="Almost there" title="Check out" />
      <form onSubmit={place} className="wrap pb-24 pt-10">
        <div className="frame relative grid border-y border-dotted border-fg/50 lg:grid-cols-[1fr_420px]">
          <X at="tl" />
          <X at="tr" />
          <X at="bl" />
          <X at="br" />
          <div className="space-y-12 p-6 md:p-10 lg:border-r lg:border-dotted lg:border-fg/50">
            <section>
              <p className="eyebrow">01 · Delivery details</p>
              <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <Field id="name" label="Full name" autoComplete="name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                <Field id="phone" label="Phone number" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <TextAreaField id="address" label="Shipping address" rows={3} autoComplete="street-address" className="sm:col-span-2" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
              </div>
            </section>
            <section>
              <p className="eyebrow">02 · Payment</p>
              <div className="mt-6 flex items-center justify-between gap-4 border border-accentfg p-5">
                <div>
                  <p className="text-[18px] tracking-[-0.01em] text-head">Cash on delivery</p>
                  <p className="mono">Pay in cash when your order arrives.</p>
                </div>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-onaccent">
                  <Check size={14} strokeWidth={3} />
                </span>
              </div>
            </section>
          </div>

          <aside className="h-fit p-6 md:p-8 lg:sticky lg:top-24">
            <p className="eyebrow">Order summary</p>
            <ul className="mt-6 space-y-4">
              {items.map((i) => (
                <li key={i.product._id} className="flex items-center gap-3">
                  <img src={i.product.image} alt="" className={`shot h-14 w-14 shrink-0 ${isPhoto(i.product.image) ? 'object-cover' : 'object-contain p-1'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-head">{i.product.name}</span>
                    <span className="mono text-[12px]">Qty {i.quantity}</span>
                  </span>
                  <span className="font-mono text-[13px] text-head">{formatPrice(i.product.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-dotted border-fg/50 pt-4 font-mono text-[13px]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="text-head">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="text-head">{delivery === 0 ? 'Free' : formatPrice(delivery)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="text-head">Total</dt>
                <dd className="text-[1.6rem] font-medium tracking-[-0.03em] text-head">{formatPrice(subtotal + delivery)}</dd>
              </div>
            </dl>

            {err && (
              <p role="alert" className="mt-4 border border-danger/60 px-3 py-2 font-mono text-[12px] text-danger">
                {err}
              </p>
            )}
            <button type="submit" disabled={!valid || busy} className="pill-accent pill pill-lg mt-6 w-full">
              {busy ? 'Placing order…' : 'Place order'}
            </button>
          </aside>
        </div>
      </form>
    </>
  );
}
