'use client';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number; // use 0 in the cart so "-" at 1 removes the line
  max?: number;
}

const btn = 'grid h-8 w-8 place-items-center transition hover:bg-canvas disabled:opacity-30';

export default function QtyStepper({ value, onChange, min = 1, max = 99 }: Props) {
  const removing = min === 0 && value === 1;
  return (
    <div role="group" aria-label="Quantity" className="inline-flex items-center overflow-hidden rounded-md border border-line bg-white">
      <button type="button" aria-label={removing ? 'Remove from bag' : 'Decrease quantity'} disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
        {removing ? <Trash2 size={13} /> : <Minus size={13} />}
      </button>
      <span aria-live="polite" className="w-7 text-center text-[13px] font-medium tabular-nums">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <Plus size={13} />
      </button>
    </div>
  );
}
