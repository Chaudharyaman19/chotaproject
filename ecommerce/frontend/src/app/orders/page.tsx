'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import StatusPill from '../../components/StatusPill';
import SignInPrompt from '../../components/SignInPrompt';
import Loading from '../../components/Loading';
import PageHero from '../../components/PageHero';
import { X } from '../../components/ui/Primitives';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = () =>
    api
      .get('/orders/my')
      .then((d) => setOrders(d.orders ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not load orders'))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user]);

  if (authLoading || (user && loading)) return <Loading />;
  if (!user) return <SignInPrompt message="Sign in to see your orders." />;

  const cancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.patch(`/orders/${id}/cancel`, {});
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not cancel');
    }
  };

  return (
    <>
      <PageHero eyebrow={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`} title="Your orders" />
      <div className="wrap pb-24 pt-10">
        {err && (
          <p role="alert" className="mb-6 border border-danger/60 px-3 py-2 font-mono text-[12px] text-danger">
            {err}
          </p>
        )}
        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="h3">No orders yet.</p>
            <p className="mono mt-2">When you place an order, you’ll find it here.</p>
            <Link href="/products" className="pill-accent pill pill-lg mt-8">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-6">
            {orders.map((o) => (
              <li key={o._id} className="relative animate-fade-up border border-dotted border-fg/50">
                <X at="tl" />
                <X at="tr" />
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dotted border-fg/50 p-5 md:px-8">
                  <div>
                    <p className="text-[1.4rem] font-medium uppercase leading-none tracking-[-0.03em] text-head">#{o.orderNumber}</p>
                    <p className="mono mt-1.5">Placed {formatDate(o.createdAt)}</p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
                <ul className="divide-y divide-dotted divide-fg/40 px-5 md:px-8">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-4 py-3 text-[15px]">
                      <span className="text-head">
                        {it.name} <span className="mono">× {it.quantity}</span>
                      </span>
                      <span className="font-mono text-[13px] text-head">{formatPrice(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dotted border-fg/50 p-5 md:px-8">
                  <p className="mono">Cash on delivery · {o.paymentStatus.toLowerCase()}</p>
                  <div className="flex items-center gap-5">
                    {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                      <button onClick={() => cancel(o._id)} className="link font-mono text-[12px]">
                        Cancel order
                      </button>
                    )}
                    <p className="text-[1.4rem] font-medium tracking-[-0.03em] text-head">{formatPrice(o.total)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
