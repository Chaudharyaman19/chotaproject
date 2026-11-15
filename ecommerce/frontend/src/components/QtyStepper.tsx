'use client';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number; // use 0 in the cart so "-" at 1 removes the line
  max?: number;
}

const btn = 'grid h-10 w-10 place-items-center text-head transition-colors hover:bg-head hover:text-bg disabled:pointer-events-none disabled:opacity-30';

export default function QtyStepper({ value, onChange, min = 1, max = 99 }: Props) {
  const removing = min === 0 && value === 1;
  return (
    <div role="group" aria-label="Quantity" className="inline-flex items-center overflow-hidden rounded-full border border-fg/50">
      <button type="button" aria-label={removing ? 'Remove from bag' : 'Decrease quantity'} disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
        {removing ? <Trash2 size={14} /> : <Minus size={14} />}
      </button>
      <span aria-live="polite" className="w-8 text-center font-mono text-[14px] tabular-nums text-head">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <Plus size={14} />
      </button>
    </div>
  );
}
