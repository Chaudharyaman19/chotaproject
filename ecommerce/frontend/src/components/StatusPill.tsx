const styles: Record<string, string> = {
  PENDING: 'bg-[#fff4e5] text-[#b25000]',
  CONFIRMED: 'bg-[#e8f2ff] text-[#0b5cb8]',
  SHIPPED: 'bg-[#eeeaff] text-[#5b3fd0]',
  DELIVERED: 'bg-[#e6f6ea] text-[#1d7a36]',
  CANCELLED: 'bg-black/5 text-mute',
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${styles[status] ?? 'bg-black/5 text-mute'}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
