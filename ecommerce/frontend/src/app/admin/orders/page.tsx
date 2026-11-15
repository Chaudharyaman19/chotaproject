'use client';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDateTime, formatPrice } from '../../../lib/format';
import { Order } from '../../../types';
import StatusPill from '../../../components/StatusPill';
import { PageTitle, Pagination, Panel, SearchBox, downloadCsv, td, th } from '../../../components/admin/ui';
import { ErrorState } from '../../../components/Loading';

const PER = 12;
const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const who = (o: Order) => (typeof o.user === 'object' && o.user ? o.user : null);

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    api
      .get('/orders')
      .then((d) => setOrders(d.orders ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not load orders'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length])), [orders]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return orders.filter((o) => (!status || o.status === status) && (!n || [o.orderNumber, o.customerName, o.phone, who(o)?.email].some((v) => v?.toLowerCase().includes(n))));
  }, [orders, status, q]);
  useEffect(() => setPage(1), [status, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const safe = Math.min(page, pages);
  const rows = filtered.slice((safe - 1) * PER, safe * PER);

  const setOrderStatus = async (o: Order, next: string) => {
    try {
      const saved: Order = await api.patch(`/orders/${o._id}/status`, { status: next });
      setOrders((os) => os.map((x) => (x._id === o._id ? { ...x, status: saved.status } : x)));
      setMsg({ ok: true, text: `Order #${o.orderNumber} marked ${next.toLowerCase()}.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not update status' });
    }
  };

  const exportCsv = () =>
    downloadCsv('orders.csv', [
      ['Order', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Subtotal', 'Shipping', 'Total', 'Status'],
      ...filtered.map((o) => [o.orderNumber, o.createdAt, o.customerName, who(o)?.email, o.phone, o.shippingAddress, o.items.map((i) => `${i.name} x${i.quantity}`).join('; '), o.subtotal, o.shippingFee ?? 0, o.total, o.status]),
    ]);

  if (err) return <ErrorState message={err} onRetry={load} />;

  const chip = (on: boolean) => `pill pill-sm ${on ? '!border-accent !bg-accent !text-onaccent before:hidden' : ''}`;

  return (
    <>
      <PageTitle eyebrow="Sales" title="Orders">
        <button onClick={exportCsv} className="pill pill-sm">
          <Download size={13} /> Export CSV
        </button>
      </PageTitle>
      {msg && (
        <p role="status" className={`mb-4 border px-4 py-2.5 font-mono text-[12px] ${msg.ok ? 'border-ok/60 text-ok' : 'border-danger/60 text-danger'}`}>
          {msg.text}
        </p>
      )}

      <Panel pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-dotted border-fg/30 p-4">
          <button onClick={() => setStatus('')} className={chip(status === '')}>All · {orders.length}</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(status === s ? '' : s)} className={chip(status === s)}>
              <span className="capitalize">{s.toLowerCase()}</span> · {counts[s]}
            </button>
          ))}
          <div className="ml-auto">
            <SearchBox value={q} onChange={setQ} placeholder="Order #, name, phone…" />
          </div>
        </div>

        <div data-lenis-prevent className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[820px] text-[14px]">
            <thead>
              <tr className="border-b border-dotted border-fg/30">
                <th className={`${th} w-10`} />
                <th className={th}>Order</th>
                <th className={th}>Customer</th>
                <th className={th}>Date</th>
                <th className={th}>Total</th>
                <th className={th}>Status</th>
                <th className={th}>Update</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-2.5">
                        <div className="skeleton h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.map((o) => {
                    const final = o.status === 'DELIVERED' || o.status === 'CANCELLED';
                    return (
                      <Fragment key={o._id}>
                        <tr className="border-b border-dotted border-fg/20 hover:bg-fg/[0.06]">
                          <td className={td}>
                            <button aria-label="Toggle details" aria-expanded={open === o._id} onClick={() => setOpen(open === o._id ? null : o._id)} className="grid h-7 w-7 place-items-center rounded-full text-head hover:bg-fg/15">
                              <ChevronDown size={15} className={`transition-transform ${open === o._id ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                          <td className={`${td} text-head`}>#{o.orderNumber}</td>
                          <td className={td}>
                            <span className="block text-head">{o.customerName}</span>
                            <span className="block font-mono text-[11px]">{who(o)?.email ?? o.phone}</span>
                          </td>
                          <td className={`${td} font-mono text-[12px]`}>{formatDateTime(o.createdAt)}</td>
                          <td className={`${td} font-mono text-[13px] text-head`}>{formatPrice(o.total)}</td>
                          <td className={td}><StatusPill status={o.status} /></td>
                          <td className={td}>
                            <select value={o.status} disabled={final} onChange={(e) => setOrderStatus(o, e.target.value)} aria-label={`Status for order ${o.orderNumber}`} className="select !h-8 disabled:opacity-40">
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0) + s.slice(1).toLowerCase()}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {open === o._id && (
                          <tr className="border-b border-dotted border-fg/20 bg-fg/[0.04]">
                            <td />
                            <td colSpan={6} className="px-4 py-5">
                              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                                <ul className="divide-y divide-dotted divide-fg/30">
                                  {o.items.map((it, i) => (
                                    <li key={i} className="flex justify-between gap-4 py-2 text-[14px]">
                                      <span className="text-head">{it.name} <span className="font-mono text-[12px]">× {it.quantity}</span></span>
                                      <span className="font-mono text-[12px] text-head">{formatPrice(it.price * it.quantity)}</span>
                                    </li>
                                  ))}
                                  <li className="flex justify-between gap-4 py-2 font-mono text-[12px]"><span>Shipping</span><span>{formatPrice(o.shippingFee ?? 0)}</span></li>
                                  <li className="flex justify-between gap-4 py-2 font-mono text-[13px] text-head"><span>Total (cash on delivery)</span><span>{formatPrice(o.total)}</span></li>
                                </ul>
                                <div className="space-y-3 font-mono text-[12px]">
                                  <p><span className="eyebrow block">Ship to</span><span className="whitespace-pre-line text-head">{o.shippingAddress}</span></p>
                                  <p><span className="eyebrow block">Phone</span><a href={`tel:${o.phone}`} className="link text-head">{o.phone}</a></p>
                                  {who(o)?.email && <p><span className="eyebrow block">Email</span><a href={`mailto:${who(o)!.email}`} className="link text-head">{who(o)!.email}</a></p>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center font-mono text-[13px]">No orders match.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={safe} pages={pages} onPage={setPage} total={filtered.length} per={PER} />
      </Panel>
    </>
  );
}
