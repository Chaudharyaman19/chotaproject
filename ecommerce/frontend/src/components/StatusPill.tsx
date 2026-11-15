const styles: Record<string, string> = {
  PENDING: 'border-warn/60 text-warn',
  CONFIRMED: 'border-[#6fb4ff]/60 text-[#6fb4ff]',
  SHIPPED: 'border-accentfg/70 text-accentfg',
  DELIVERED: 'border-ok/70 text-ok',
  CANCELLED: 'border-fg/40 text-fg/70',
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] ${styles[status] ?? 'border-fg/40 text-fg'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.toLowerCase()}
    </span>
  );
}
