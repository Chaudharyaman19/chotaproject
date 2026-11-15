'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Download, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { discountPct, formatPrice } from '../../../lib/format';
import { Product } from '../../../types';
import { Drawer, PageTitle, Pagination, Panel, SearchBox, Switch, downloadCsv, td, th } from '../../../components/admin/ui';
import { ErrorState } from '../../../components/Loading';
import { Field, TextAreaField } from '../../../components/ui/Field';
import { isPhoto } from '../../../components/ProductCard';

const PER = 12;
const blank = { name: '', brand: '', sku: '', category: '', price: '', compareAtPrice: '', stock: '0', rating: '', featured: false, isActive: true, image: '', images: '', tags: '', description: '' };
type Form = typeof blank;
const SORTS: Record<string, (a: Product, b: Product) => number> = {
  newest: (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  name: (a, b) => a.name.localeCompare(b.name),
  'price-desc': (a, b) => b.price - a.price,
  'price-asc': (a, b) => a.price - b.price,
  'stock-asc': (a, b) => a.stock - b.stock,
};

const toForm = (p: Product): Form => ({
  name: p.name, brand: p.brand ?? '', sku: p.sku ?? '', category: p.category, price: String(p.price), compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
  stock: String(p.stock), rating: p.rating ? String(p.rating) : '', featured: !!p.featured, isActive: p.isActive !== false, image: p.image,
  images: (p.images ?? []).filter((i) => i !== p.image).join('\n'), tags: (p.tags ?? []).join(', '), description: p.description,
});

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    api
      .get('/products/admin/all')
      .then((d) => setProducts(d.products ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not load products'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), [products]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products
      .filter((p) => (cat ? p.category === cat : true))
      .filter((p) => {
        if (status === 'active') return p.isActive !== false;
        if (status === 'hidden') return p.isActive === false;
        if (status === 'low') return p.isActive !== false && p.stock > 0 && p.stock <= 5;
        if (status === 'out') return p.stock === 0;
        if (status === 'featured') return !!p.featured;
        return true;
      })
      .filter((p) => !needle || [p.name, p.brand, p.sku, p.category].some((v) => v?.toLowerCase().includes(needle)))
      .sort(SORTS[sort]);
  }, [products, q, cat, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PER, safePage * PER);
  useEffect(() => setPage(1), [q, cat, status, sort]);

  const patchLocal = (id: string, patch: Partial<Product>) => setProducts((ps) => ps.map((p) => (p._id === id ? { ...p, ...patch } : p)));
  const flash = (ok: boolean, text: string) => setMsg({ ok, text });

  const update = async (p: Product, patch: Partial<Product>, okText?: string) => {
    const before = { ...p };
    patchLocal(p._id, patch); // optimistic
    try {
      await api.put(`/products/${p._id}`, patch);
      if (okText) flash(true, okText);
    } catch (e) {
      patchLocal(p._id, before);
      flash(false, e instanceof Error ? e.message : 'Update failed');
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete “${p.name}”?\nIt is hidden from the shop but kept in order history.`)) return;
    try {
      await api.del(`/products/${p._id}`);
      patchLocal(p._id, { isActive: false });
      flash(true, 'Product deleted (hidden from shop).');
    } catch (e) {
      flash(false, e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const bulk = async (kind: 'show' | 'hide' | 'delete') => {
    const ids = Array.from(sel);
    if (kind === 'delete' && !confirm(`Delete ${ids.length} products? They are hidden from the shop but kept in order history.`)) return;
    const results = await Promise.allSettled(ids.map((id) => (kind === 'delete' ? api.del(`/products/${id}`) : api.put(`/products/${id}`, { isActive: kind === 'show' }))));
    const okIds = ids.filter((_, i) => results[i].status === 'fulfilled');
    okIds.forEach((id) => patchLocal(id, { isActive: kind === 'show' }));
    setSel(new Set());
    flash(okIds.length === ids.length, `${okIds.length}/${ids.length} products ${kind === 'show' ? 'shown' : 'hidden'}.`);
  };

  const openNew = (from?: Product) => {
    setFormErr('');
    setEditing({ id: null, form: from ? { ...toForm(from), name: `${from.name} (copy)`, sku: '' } : { ...blank } });
  };
  const openEdit = (p: Product) => {
    setFormErr('');
    setEditing({ id: p._id, form: toForm(p) });
  };

  const save = async () => {
    if (!editing) return;
    const f = editing.form;
    const num = (s: string) => (s.trim() === '' ? NaN : Number(s));
    const price = num(f.price);
    const stock = num(f.stock);
    if (f.name.trim().length < 2) return setFormErr('Name must be at least 2 characters.');
    if (f.category.trim().length < 2) return setFormErr('Pick or type a category.');
    if (!Number.isFinite(price) || price < 0) return setFormErr('Enter a valid price.');
    if (!Number.isInteger(stock) || stock < 0) return setFormErr('Stock must be a whole number, 0 or more.');
    if (!/^https?:\/\//.test(f.image.trim())) return setFormErr('Main image must be a full URL (https://…).');
    if (f.description.trim().length < 5) return setFormErr('Add a short description.');
    const gallery = f.images.split('\n').map((s) => s.trim()).filter(Boolean);
    if (gallery.some((g) => !/^https?:\/\//.test(g))) return setFormErr('Every gallery image must be a full URL, one per line.');
    const cmp = num(f.compareAtPrice);
    const rating = num(f.rating);
    const body = {
      name: f.name.trim(), description: f.description.trim(), price, image: f.image.trim(), category: f.category.trim(), stock,
      isActive: f.isActive, featured: f.featured, brand: f.brand.trim() || undefined, sku: f.sku.trim() || undefined,
      compareAtPrice: Number.isFinite(cmp) && cmp > 0 ? cmp : null, rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : undefined,
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12), images: gallery,
    };
    setSaving(true);
    setFormErr('');
    try {
      if (editing.id) {
        const saved: Product = await api.put(`/products/${editing.id}`, body);
        patchLocal(editing.id, saved);
        flash(true, 'Product updated.');
      } else {
        const saved: Product = await api.post('/products', body);
        setProducts((ps) => [saved, ...ps]);
        flash(true, 'Product created.');
      }
      setEditing(null);
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () =>
    downloadCsv('products.csv', [
      ['Name', 'Brand', 'SKU', 'Category', 'Price', 'Compare at', 'Stock', 'Rating', 'Featured', 'Active', 'Image'],
      ...filtered.map((p) => [p.name, p.brand, p.sku, p.category, p.price, p.compareAtPrice, p.stock, p.rating, !!p.featured, p.isActive !== false, p.image]),
    ]);

  const allOnPage = rows.length > 0 && rows.every((r) => sel.has(r._id));
  const setF = (patch: Partial<Form>) => setEditing((e) => (e ? { ...e, form: { ...e.form, ...patch } } : e));

  if (err) return <ErrorState message={err} onRetry={load} />;

  return (
    <>
      <PageTitle eyebrow="Catalogue" title="Products">
        <button onClick={exportCsv} className="pill pill-sm">
          <Download size={13} /> Export CSV
        </button>
        <button onClick={() => openNew()} className="pill-accent pill pill-sm">
          <Plus size={14} /> Add product
        </button>
      </PageTitle>

      {msg && (
        <p role="status" className={`mb-4 border px-4 py-2.5 font-mono text-[12px] ${msg.ok ? 'border-ok/60 text-ok' : 'border-danger/60 text-danger'}`}>
          {msg.text}
        </p>
      )}

      <Panel pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-dotted border-fg/30 p-4">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, brand, SKU…" />
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="select">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className="select">
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="featured">Featured</option>
            <option value="low">Low stock</option>
            <option value="out">Sold out</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="select">
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
            <option value="price-desc">Price high → low</option>
            <option value="price-asc">Price low → high</option>
            <option value="stock-asc">Stock low → high</option>
          </select>
          <span className="ml-auto font-mono text-[12px]">{filtered.length} products</span>
        </div>

        {sel.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-dotted border-fg/30 bg-accent/10 px-4 py-2.5">
            <span className="font-mono text-[12px] text-head">{sel.size} selected</span>
            <button onClick={() => bulk('show')} className="pill pill-sm">Show</button>
            <button onClick={() => bulk('hide')} className="pill pill-sm">Hide</button>
            <button onClick={() => bulk('delete')} className="pill pill-sm !border-danger/60 !text-danger">Delete</button>
            <button onClick={() => setSel(new Set())} className="link ml-auto font-mono text-[12px]">Clear</button>
          </div>
        )}

        <div data-lenis-prevent className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[860px] text-[14px]">
            <thead>
              <tr className="border-b border-dotted border-fg/30">
                <th className={`${th} w-10`}>
                  <input type="checkbox" aria-label="Select all on page" checked={allOnPage} onChange={() => setSel((s) => { const n = new Set(s); rows.forEach((r) => (allOnPage ? n.delete(r._id) : n.add(r._id))); return n; })} className="accent-[rgb(var(--accent))]" />
                </th>
                <th className={th}>Product</th>
                <th className={th}>Category</th>
                <th className={th}>Price</th>
                <th className={th}>Stock</th>
                <th className={th}>Live</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-dotted border-fg/20">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="skeleton h-12 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.map((p) => {
                    const off = discountPct(p.price, p.compareAtPrice);
                    return (
                      <tr key={p._id} className={`border-b border-dotted border-fg/20 transition-colors hover:bg-fg/[0.06] ${p.isActive === false ? 'opacity-55' : ''}`}>
                        <td className={td}>
                          <input type="checkbox" aria-label={`Select ${p.name}`} checked={sel.has(p._id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(p._id) ? n.delete(p._id) : n.add(p._id); return n; })} className="accent-[rgb(var(--accent))]" />
                        </td>
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt="" className={`shot h-12 w-12 shrink-0 ${isPhoto(p.image) ? 'object-cover' : 'object-contain p-1'}`} />
                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate text-head">
                                {p.name} {p.featured && <span className="ml-1 rounded-full border border-accentfg/60 px-1.5 py-px align-middle font-mono text-[10px] text-accentfg">featured</span>}
                              </p>
                              <p className="font-mono text-[11px]">{[p.brand, p.sku].filter(Boolean).join(' · ') || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`${td} font-mono text-[12px]`}>{p.category}</td>
                        <td className={`${td} font-mono text-[13px]`}>
                          <span className="text-head">{formatPrice(p.price)}</span>
                          {off > 0 && <span className="ml-2 text-[11px] text-fg/60 line-through">{formatPrice(p.compareAtPrice!)}</span>}
                        </td>
                        <td className={td}>
                          <div className="inline-flex items-center rounded-full border border-fg/40">
                            <button aria-label="Decrease stock" disabled={p.stock <= 0} onClick={() => update(p, { stock: p.stock - 1 })} className="grid h-7 w-7 place-items-center text-head hover:bg-fg/15 disabled:opacity-30">
                              <Minus size={12} />
                            </button>
                            <span className={`w-9 text-center font-mono text-[12px] tabular-nums ${p.stock === 0 ? 'text-danger' : p.stock <= 5 ? 'text-warn' : 'text-head'}`}>{p.stock}</span>
                            <button aria-label="Increase stock" onClick={() => update(p, { stock: p.stock + 1 })} className="grid h-7 w-7 place-items-center text-head hover:bg-fg/15">
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className={td}>
                          <Switch checked={p.isActive !== false} label={`${p.name} visible in shop`} onChange={(v) => update(p, { isActive: v }, v ? 'Product is live.' : 'Product hidden from shop.')} />
                        </td>
                        <td className={`${td} text-right`}>
                          <div className="inline-flex gap-1">
                            <button aria-label={`Edit ${p.name}`} title="Edit" onClick={() => openEdit(p)} className="icon-btn !h-8 !w-8"><Pencil size={13} /></button>
                            <button aria-label={`Duplicate ${p.name}`} title="Duplicate" onClick={() => openNew(p)} className="icon-btn !h-8 !w-8"><Copy size={13} /></button>
                            <button aria-label={`Delete ${p.name}`} title="Delete" onClick={() => remove(p)} className="icon-btn !h-8 !w-8 hover:!border-danger hover:!bg-danger"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center font-mono text-[13px]">
                    No products match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={safePage} pages={pages} onPage={setPage} total={filtered.length} per={PER} />
      </Panel>

      <Drawer
        open={!!editing}
        title={editing?.id ? 'Edit product' : 'New product'}
        onClose={() => setEditing(null)}
        footer={
          <>
            {formErr && (
              <p role="alert" className="mr-auto max-w-[60%] font-mono text-[12px] text-danger">
                {formErr}
              </p>
            )}
            <button onClick={() => setEditing(null)} className="pill">Cancel</button>
            <button onClick={save} disabled={saving} className="pill-accent pill">{saving ? 'Saving…' : editing?.id ? 'Save changes' : 'Create product'}</button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
            <Field id="pf-name" label="Name *" className="sm:col-span-2" value={editing.form.name} onChange={(e) => setF({ name: e.target.value })} />
            <Field id="pf-brand" label="Brand" value={editing.form.brand} onChange={(e) => setF({ brand: e.target.value })} />
            <Field id="pf-sku" label="SKU" value={editing.form.sku} onChange={(e) => setF({ sku: e.target.value })} />
            <div>
              <label htmlFor="pf-cat" className="eyebrow block">Category *</label>
              <input id="pf-cat" list="pf-cats" className="input" value={editing.form.category} onChange={(e) => setF({ category: e.target.value })} />
              <datalist id="pf-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <Field id="pf-rating" label="Rating (0–5)" type="number" min={0} max={5} step="0.1" value={editing.form.rating} onChange={(e) => setF({ rating: e.target.value })} />
            <Field id="pf-price" label="Price (USD) *" type="number" min={0} step="0.01" value={editing.form.price} onChange={(e) => setF({ price: e.target.value })} />
            <Field id="pf-cmp" label="Compare-at price" hint="Higher than price → shows a discount" type="number" min={0} step="0.01" value={editing.form.compareAtPrice} onChange={(e) => setF({ compareAtPrice: e.target.value })} />
            <Field id="pf-stock" label="Stock *" type="number" min={0} step="1" value={editing.form.stock} onChange={(e) => setF({ stock: e.target.value })} />
            <div className="flex items-end gap-6 pb-3">
              <label className="flex items-center gap-2.5 font-mono text-[12px] text-head"><Switch checked={editing.form.isActive} onChange={(v) => setF({ isActive: v })} label="Active" /> Active</label>
              <label className="flex items-center gap-2.5 font-mono text-[12px] text-head"><Switch checked={editing.form.featured} onChange={(v) => setF({ featured: v })} label="Featured" /> Featured</label>
            </div>
            <div className="sm:col-span-2">
              <Field id="pf-img" label="Main image URL *" value={editing.form.image} onChange={(e) => setF({ image: e.target.value })} />
              {/^https?:\/\//.test(editing.form.image) && <img src={editing.form.image} alt="Preview" className={`shot mt-3 h-28 w-28 ${isPhoto(editing.form.image) ? 'object-cover' : 'object-contain p-2'}`} onError={(e) => (e.currentTarget.style.opacity = '.2')} />}
            </div>
            <TextAreaField id="pf-gal" label="Gallery image URLs" hint="One per line" rows={3} className="sm:col-span-2" value={editing.form.images} onChange={(e) => setF({ images: e.target.value })} />
            <Field id="pf-tags" label="Tags" hint="Comma separated" className="sm:col-span-2" value={editing.form.tags} onChange={(e) => setF({ tags: e.target.value })} />
            <TextAreaField id="pf-desc" label="Description *" rows={5} className="sm:col-span-2" value={editing.form.description} onChange={(e) => setF({ description: e.target.value })} />
          </div>
        )}
      </Drawer>
    </>
  );
}
