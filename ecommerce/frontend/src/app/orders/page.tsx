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

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/orders/my')
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user]);

  if (authLoading || (user && loading)) return <Loading />;
  if (!user) return <SignInPrompt message="Sign in to see your orders." />;

  const cancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return;
    await api.patch(`/orders/${id}/cancel`, {});
    load();
  };

  return (
    <div className="wrap py-5">
      <h1 className="h-page">Your orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-medium">No orders yet.</p>
          <p className="mt-1 text-xs text-mute">When you place an order, you’ll find it here.</p>
          <Link href="/products" className="btn-primary mt-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o._id} className="animate-fade-up rounded-lg border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px]">
                  <span className="font-semibold">Order #{o.orderNumber}</span> <span className="text-mute">· {formatDate(o.createdAt)}</span>
                </p>
                <StatusPill status={o.status} />
              </div>

              <ul className="mt-2 divide-y divide-line border-t border-line text-[13px]">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-4 py-1.5">
                    <span>
                      {it.name} <span className="text-mute">× {it.quantity}</span>
                    </span>
                    <span className="tabular-nums">{formatPrice(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
                <p className="text-xs text-mute">Cash on delivery · {o.paymentStatus.toLowerCase()}</p>
                <p className="text-sm font-semibold">{formatPrice(o.total)}</p>
              </div>

              {(o.status === 'PENDING' || o.status === 'CONFIRMED') && (
                <button onClick={() => cancel(o._id)} className="link mt-1 text-xs text-mute">
                  Cancel order
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
