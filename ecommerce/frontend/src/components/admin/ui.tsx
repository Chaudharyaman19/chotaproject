'use client';
import { ReactNode, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X as XIcon } from 'lucide-react';

/* ---------- containers ---------- */
export function Panel({ title, action, children, className = '', pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`relative border border-fg/25 bg-panel/40 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-dotted border-fg/30 px-5 py-3.5">
          <h2 className="eyebrow !text-head">{title}</h2>
          {action}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 text-[clamp(2rem,3.4vw,3rem)] font-medium uppercase leading-none tracking-[-0.04em] text-head">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Kpi({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'warn' | 'ok' }) {
  return (
    <div className="relative border border-fg/25 bg-panel/40 p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-[clamp(1.8rem,2.6vw,2.5rem)] font-medium leading-none tracking-[-0.04em] text-head">{value}</p>
      {sub && <p className={`mt-3 font-mono text-[12px] ${tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : ''}`}>{sub}</p>}
    </div>
  );
}

/* ---------- controls ---------- */
export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors disabled:opacity-40 ${checked ? 'border-accentfg bg-accent' : 'border-fg/50 bg-transparent'}`}>
      <span className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-all ${checked ? 'left-[18px] bg-onaccent' : 'left-1 bg-fg'}`} />
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} type="search" placeholder={placeholder} aria-label={placeholder} className="h-10 w-full min-w-[200px] rounded-full border border-fg/50 bg-transparent px-4 font-mono text-[12px] text-head outline-none transition-colors placeholder:text-fg/60 focus:border-head sm:w-64 [&::-webkit-search-cancel-button]:hidden" />
  );
}

export function Pagination({ page, pages, onPage, total, per }: { page: number; pages: number; onPage: (p: number) => void; total: number; per: number }) {
  if (total === 0) return null;
  const from = (page - 1) * per + 1;
  const to = Math.min(total, page * per);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-dotted border-fg/30 px-5 py-3 font-mono text-[12px]">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="icon-btn !h-8 !w-8 disabled:opacity-30">
          <ChevronLeft size={14} />
        </button>
        <span className="tabular-nums text-head">
          {page} / {pages}
        </span>
        <button aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="icon-btn !h-8 !w-8 disabled:opacity-30">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/** Right-hand slide-over (product editor). Esc / backdrop click close it. */
export function Drawer({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[560px] animate-fade-in flex-col border-l border-fg/30 bg-bg shadow-2xl">
        <header className="flex items-center justify-between border-b border-dotted border-fg/40 px-6 py-4">
          <h2 className="text-[1.4rem] font-medium uppercase tracking-[-0.03em] text-head">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="icon-btn">
            <XIcon size={16} />
          </button>
        </header>
        <div data-lenis-prevent className="thin-scroll flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
        {footer && <footer className="flex items-center justify-end gap-3 border-t border-dotted border-fg/40 px-6 py-4">{footer}</footer>}
      </aside>
    </div>
  );
}

/* ---------- table helpers ---------- */
export const th = 'whitespace-nowrap px-4 py-3 text-left font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-fg';
export const td = 'px-4 py-3 align-middle';

/* ---------- charts ---------- */
export function BarChart({ data, format }: { data: { label: string; value: number }[]; format: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = Math.ceil(max / 4 / Math.pow(10, Math.floor(Math.log10(max / 4 || 1)))) * Math.pow(10, Math.floor(Math.log10(max / 4 || 1))) * 4 || 1;
  const W = 720, H = 220, L = 8, B = 26, T = 14;
  const bw = (W - L) / data.length;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[240px] w-full" role="img" aria-label="Revenue by day">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = T + ((H - B - T) * i) / 4;
          return <line key={i} x1={L} x2={W} y1={y} y2={y} stroke="currentColor" strokeOpacity=".22" strokeDasharray="2 4" />;
        })}
        {data.map((d, i) => {
          const h = ((H - B - T) * d.value) / nice;
          const x = L + i * bw + bw * 0.18;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={L + i * bw} y={T} width={bw} height={H - B - T} fill="transparent" />
              <rect x={x} y={H - B - Math.max(h, d.value > 0 ? 2 : 0)} width={bw * 0.64} height={Math.max(h, d.value > 0 ? 2 : 0)} fill="rgb(var(--accentfg))" opacity={hover === null || hover === i ? 1 : 0.35} style={{ transition: 'opacity .15s, height .5s, y .5s' }} />
              {(data.length <= 14 || i % Math.ceil(data.length / 10) === 0) && (
                <text x={L + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="currentColor" opacity=".7" fontFamily="var(--font-mono)">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 border border-fg/40 bg-bg px-2.5 py-1.5 font-mono text-[11px] text-head" style={{ left: `${((L + hover * bw + bw / 2) / W) * 100}%` }}>
          {data[hover].label} · {format(data[hover].value)}
        </div>
      )}
    </div>
  );
}

/* ---------- csv ---------- */
export function downloadCsv(filename: string, rows: (string | number | boolean | null | undefined)[][]) {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    // Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell).
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const blob = new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
