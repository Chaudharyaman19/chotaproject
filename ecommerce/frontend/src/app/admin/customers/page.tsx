'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate, formatPrice } from '../../../lib/format';
import { Customer } from '../../../types';
import { PageTitle, Pagination, Panel, SearchBox, downloadCsv, td, th } from '../../../components/admin/ui';
import { ErrorState } from '../../../components/Loading';

const PER = 12;

export default function AdminCustomers() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('spent');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    api
      .get('/admin/customers')
      .then((d) => setRows(d.customers ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not load customers'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = rows.filter((c) => !n || c.name.toLowerCase().includes(n) || c.email.toLowerCase().includes(n));
    const by: Record<string, (a: Customer, b: Customer) => number> = {
      spent: (a, b) => b.spent - a.spent,
      orders: (a, b) => b.orders - a.orders,
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(by[sort]);
  }, [rows, q, sort]);
  useEffect(() => setPage(1), [q, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const safe = Math.min(page, pages);
  const slice = filtered.slice((safe - 1) * PER, safe * PER);
  const totalSpent = rows.reduce((t, c) => t + c.spent, 0);

  if (err) return <ErrorState message={err} onRetry={load} />;

  return (
    <>
      <PageTitle eyebrow="People" title="Customers">
        <button onClick={() => downloadCsv('customers.csv', [['Name', 'Email', 'Role', 'Orders', 'Spent', 'Last order', 'Joined'], ...filtered.map((c) => [c.name, c.email, c.role, c.orders, c.spent, c.lastOrderAt, c.createdAt])])} className="pill pill-sm">
          <Download size={13} /> Export CSV
        </button>
      </PageTitle>

      <Panel pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-dotted border-fg/30 p-4">
          <SearchBox value={q} onChange={setQ} placeholder="Search name or email…" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="select">
            <option value="spent">Top spenders</option>
            <option value="orders">Most orders</option>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
          </select>
          <span className="ml-auto font-mono text-[12px]">{rows.length} accounts · {formatPrice(totalSpent)} lifetime</span>
        </div>
        <div data-lenis-prevent className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] text-[14px]">
            <thead>
              <tr className="border-b border-dotted border-fg/30">
                <th className={th}>Customer</th>
                <th className={th}>Role</th>
                <th className={th}>Orders</th>
                <th className={th}>Spent</th>
                <th className={th}>Last order</th>
                <th className={th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-2.5"><div className="skeleton h-10 w-full" /></td>
                    </tr>
                  ))
                : slice.map((c) => (
                    <tr key={c._id} className="border-b border-dotted border-fg/20 hover:bg-fg/[0.06]">
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-mono text-[12px] text-onaccent">{c.name.charAt(0).toUpperCase()}</span>
                          <div className="min-w-0">
                            <p className="truncate text-head">{c.name}</p>
                            <a href={`mailto:${c.email}`} className="link block truncate font-mono text-[11px]">{c.email}</a>
                          </div>
                        </div>
                      </td>
                      <td className={td}>
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] ${c.role === 'ADMIN' ? 'border-accentfg/70 text-accentfg' : 'border-fg/40'}`}>{c.role.toLowerCase()}</span>
                      </td>
                      <td className={`${td} font-mono text-[13px] tabular-nums text-head`}>{c.orders}</td>
                      <td className={`${td} font-mono text-[13px] tabular-nums text-head`}>{formatPrice(c.spent)}</td>
                      <td className={`${td} font-mono text-[12px]`}>{c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}</td>
                      <td className={`${td} font-mono text-[12px]`}>{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
              {!loading && slice.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-16 text-center font-mono text-[13px]">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={safe} pages={pages} onPage={setPage} total={filtered.length} per={PER} />
      </Panel>
    </>
  );
}
