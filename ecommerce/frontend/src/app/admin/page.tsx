'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { formatDateTime, formatMoney0, formatPrice } from '../../lib/format';
import { Order, Product } from '../../types';
import StatusPill from '../../components/StatusPill';
import { BarChart, Kpi, PageTitle, Panel, th, td } from '../../components/admin/ui';
import { ErrorState } from '../../components/Loading';

const RANGES = [7, 14, 30] as const;
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
const STATUS_COLOR: Record<string, string> = { PENDING: '#e9b44c', CONFIRMED: '#6fb4ff', SHIPPED: '#d591fe', DELIVERED: '#47d1b5', CANCELLED: '#6b7280' };
const userName = (o: Order) => (typeof o.user === 'object' && o.user?.name) || o.customerName;

export default function Overview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [range, setRange] = useState<(typeof RANGES)[number]>(14);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    setErr('');
    Promise.all([api.get('/orders'), api.get('/products/admin/all')])
      .then(([o, p]) => {
        setOrders(o.orders ?? []);
        setProducts(p.products ?? []);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not load dashboard'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const s = useMemo(() => {
    const live = orders.filter((o) => o.status !== 'CANCELLED');
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (range - 1));
    const prevStart = new Date(start.getTime() - range * 86400000);
    const inRange = (o: Order, a: Date, b: Date) => {
      const t = new Date(o.createdAt);
      return t >= a && t < b;
    };
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const cur = live.filter((o) => inRange(o, start, end));
    const prev = live.filter((o) => inRange(o, prevStart, start));
    const sum = (a: Order[]) => a.reduce((t, o) => t + o.total, 0);
    const revenue = sum(cur);
    const pct = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100));

    const byDay = new Map<string, number>();
    for (let i = 0; i < range; i++) byDay.set(dayKey(new Date(start.getTime() + i * 86400000)), 0);
    for (const o of cur) byDay.set(dayKey(new Date(o.createdAt)), (byDay.get(dayKey(new Date(o.createdAt))) ?? 0) + o.total);
    const series = Array.from(byDay.entries()).map(([k, value]) => ({ label: new Date(k + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value }));

    const units = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of live) for (const it of o.items) {
      const e = units.get(it.name) ?? { name: it.name, qty: 0, revenue: 0 };
      e.qty += it.quantity;
      e.revenue += it.price * it.quantity;
      units.set(it.name, e);
    }
    const top = Array.from(units.values()).sort((a, b) => b.qty - a.qty).slice(0, 6);
    const counts = Object.fromEntries(STATUS_ORDER.map((k) => [k, orders.filter((o) => o.status === k).length]));
    const active = products.filter((p) => p.isActive !== false);
    return {
      revenue, revDelta: pct(revenue, sum(prev)), orderCount: cur.length, ordDelta: pct(cur.length, prev.length),
      aov: cur.length ? revenue / cur.length : 0, series, top, counts, pending: counts.PENDING ?? 0,
      activeCount: active.length, hidden: products.length - active.length,
      low: active.filter((p) => p.stock > 0 && p.stock <= 5).sort((a, b) => a.stock - b.stock),
      out: active.filter((p) => p.stock === 0),
    };
  }, [orders, products, range]);

  if (err) return <ErrorState message={err} onRetry={load} />;
  const delta = (n: number) => (n === 0 ? 'no change' : `${n > 0 ? '▲' : '▼'} ${Math.abs(n)}% vs previous ${range}d`);

  return (
    <>
      <PageTitle eyebrow="Dashboard" title="Overview">
        <div role="group" aria-label="Date range" className="flex">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`h-9 border border-fg/50 px-4 font-mono text-[12px] first:rounded-l-full last:rounded-r-full ${range === r ? 'bg-accent text-onaccent' : 'text-head hover:bg-fg/10'}`}>
              {r}d
            </button>
          ))}
        </div>
      </PageTitle>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-[118px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Kpi label={`Revenue · ${range}d`} value={formatMoney0(s.revenue)} sub={delta(s.revDelta)} tone={s.revDelta >= 0 ? 'ok' : 'warn'} />
            <Kpi label={`Orders · ${range}d`} value={s.orderCount} sub={delta(s.ordDelta)} tone={s.ordDelta >= 0 ? 'ok' : 'warn'} />
            <Kpi label="Avg. order value" value={formatPrice(s.aov)} sub="excl. cancelled" />
            <Kpi label="Needs action" value={s.pending} sub={s.pending ? 'pending orders to confirm' : 'all caught up'} tone={s.pending ? 'warn' : 'ok'} />
            <Kpi label="Products live" value={s.activeCount} sub={`${s.hidden} hidden · ${products.length} total`} />
            <Kpi label="Stock alerts" value={s.low.length + s.out.length} sub={`${s.low.length} low · ${s.out.length} sold out`} tone={s.low.length + s.out.length ? 'warn' : 'ok'} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Panel title={`Revenue by day · last ${range} days`}>
              <BarChart data={s.series} format={formatPrice} />
            </Panel>
            <Panel title="Orders by status">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-fg/15" role="img" aria-label="Orders by status">
                {STATUS_ORDER.map((k) => (s.counts[k] ? <div key={k} title={`${k}: ${s.counts[k]}`} style={{ width: `${(s.counts[k] / Math.max(1, orders.length)) * 100}%`, background: STATUS_COLOR[k] }} /> : null))}
              </div>
              <ul className="mt-5 space-y-2.5">
                {STATUS_ORDER.map((k) => (
                  <li key={k} className="flex items-center justify-between font-mono text-[13px]">
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR[k] }} />
                      <span className="capitalize text-head">{k.toLowerCase()}</span>
                    </span>
                    <span className="tabular-nums">{s.counts[k]}</span>
                  </li>
                ))}
              </ul>
              <Link href="/admin/orders" className="pill pill-sm mt-6">
                Manage orders
              </Link>
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <Panel title="Top products · units sold">
              {s.top.length === 0 ? (
                <p className="font-mono text-[12px]">No sales yet.</p>
              ) : (
                <ul className="space-y-4">
                  {s.top.map((t) => (
                    <li key={t.name}>
                      <div className="flex items-baseline justify-between gap-3 text-[14px]">
                        <span className="truncate text-head">{t.name}</span>
                        <span className="font-mono text-[12px] tabular-nums">{t.qty} sold · {formatPrice(t.revenue)}</span>
                      </div>
                      <div className="mt-1.5 h-[3px] bg-fg/15">
                        <div className="h-full bg-accentfg" style={{ width: `${(t.qty / s.top[0].qty) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Stock alerts" action={<Link href="/admin/products" className="link font-mono text-[11px]">Manage</Link>}>
              {s.low.length + s.out.length === 0 ? (
                <p className="font-mono text-[12px]">Everything is well stocked.</p>
              ) : (
                <ul className="space-y-3">
                  {[...s.out, ...s.low].slice(0, 7).map((p) => (
                    <li key={p._id} className="flex items-center justify-between gap-3 text-[14px]">
                      <span className="truncate text-head">{p.name}</span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] ${p.stock === 0 ? 'border-danger/70 text-danger' : 'border-warn/70 text-warn'}`}>{p.stock === 0 ? 'sold out' : `${p.stock} left`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Recent orders" className="mt-4" pad={false} action={<Link href="/admin/orders" className="link font-mono text-[11px]">View all</Link>}>
            <div data-lenis-prevent className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[640px] text-[14px]">
                <thead>
                  <tr className="border-b border-dotted border-fg/30">
                    <th className={th}>Order</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Date</th>
                    <th className={th}>Total</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o._id} className="border-b border-dotted border-fg/20 last:border-0">
                      <td className={`${td} text-head`}>#{o.orderNumber}</td>
                      <td className={`${td} text-head`}>{userName(o)}</td>
                      <td className={`${td} font-mono text-[12px]`}>{formatDateTime(o.createdAt)}</td>
                      <td className={`${td} font-mono text-[13px] text-head`}>{formatPrice(o.total)}</td>
                      <td className={td}>
                        <StatusPill status={o.status} />
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td className={`${td} font-mono text-[12px]`} colSpan={5}>
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
