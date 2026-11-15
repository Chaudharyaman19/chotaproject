'use client';
import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { Order, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Field } from '../../components/Field';
import StatusPill from '../../components/StatusPill';
import SignInPrompt from '../../components/SignInPrompt';
import Loading from '../../components/Loading';

const empty = { name: '', description: '', price: 0, image: '', category: '', stock: 0, isActive: true };
const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rev, setRev] = useState(0);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const o = await api.get('/orders');
    setOrders(o.orders || []);
    setRev(o.totalRevenue || 0);
    setTotal(o.totalOrders || o.orders?.length || 0);
    const p = await api.get('/products/admin/all');
    setProducts(p.products || []);
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') load().catch((e) => setMsg(e.message));
  }, [user]);

  if (authLoading) return <Loading />;
  if (!user) return <SignInPrompt message="Sign in with an admin account to continue." />;
  if (user.role !== 'ADMIN')
    return (
      <div className="wrap-sm py-16 text-center">
        <h1 className="h-page">Admins only</h1>
        <p className="mt-1 text-[13px] text-mute">Your account doesn’t have access to this page.</p>
      </div>
    );

  const save = async () => {
    try {
      setMsg('');
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editId) await api.put(`/products/${editId}`, body);
      else await api.post('/products', body);
      setForm(empty);
      setEditId('');
      setMsg('Saved.');
      load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Something went wrong');
    }
  };
  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.del(`/products/${id}`);
    load();
  };
  const status = async (id: string, s: string) => {
    await api.patch(`/orders/${id}/status`, { status: s });
    load();
  };

  const stats = [
    { label: 'Orders', value: String(total) },
    { label: 'Revenue (excl. cancelled)', value: formatPrice(rev) },
    { label: 'Products', value: String(products.length) },
  ];

  return (
    <div className="wrap space-y-4 py-5">
      <h1 className="h-page">Admin dashboard</h1>

      {msg && (
        <p role="status" className="rounded-md border border-line bg-canvas px-3 py-2 text-xs font-medium">
          {msg}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-line p-3">
            <p className="text-lg font-semibold leading-none tracking-tight">{value}</p>
            <p className="mt-1.5 text-[11px] text-mute">{label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-line p-4">
        <h2 className="h-section">{editId ? 'Edit product' : 'Add a product'}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Field id="p-name" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field id="p-cat" label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Field id="p-img" label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Field id="p-price" label="Price" type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <Field id="p-stock" label="Stock" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          <Field id="p-desc" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} className="btn-primary btn-sm">
            {editId ? 'Update product' : 'Add product'}
          </button>
          {editId && (
            <button
              onClick={() => {
                setForm(empty);
                setEditId('');
              }}
              className="btn-gray btn-sm"
            >
              Cancel
            </button>
          )}
        </div>

        <ul className="mt-4 max-h-80 divide-y divide-line overflow-auto border-t border-line text-[13px]">
          {products.map((p) => (
            <li key={p._id} className="flex items-center justify-between gap-3 py-2">
              <span className="flex min-w-0 items-center gap-2.5">
                <img src={p.image} alt="" className="h-8 w-8 shrink-0 rounded-md border border-line bg-canvas object-cover" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="text-[11px] text-mute">
                    {formatPrice(p.price)} · {p.stock} in stock{p.isActive === false ? ' · hidden' : ''}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 gap-3 text-xs">
                <button
                  onClick={() => {
                    setForm({ name: p.name, description: p.description, price: p.price, image: p.image, category: p.category, stock: p.stock, isActive: true });
                    setEditId(p._id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="link inline-flex items-center gap-1"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => del(p._id)} className="inline-flex items-center gap-1 text-[#c4271b] hover:underline">
                  <Trash2 size={12} /> Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-line p-4">
        <h2 className="h-section">All orders</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-xs text-mute">No orders yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line text-[13px]">
            {orders.map((o) => (
              <li key={o._id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="font-semibold">#{o.orderNumber}</span> <span className="text-mute">· {o.customerName} · </span>
                  <span className="font-medium">{formatPrice(o.total)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusPill status={o.status} />
                  <select value={o.status} onChange={(e) => status(o._id, e.target.value)} aria-label={`Status for order ${o.orderNumber}`} className="select">
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
