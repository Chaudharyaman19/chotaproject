'use client';
import { ReactNode } from 'react';
import { X } from './Primitives';

/**
 * One row of an accordion. Height animates with CSS grid (0fr -> 1fr), so no measuring or JS needed.
 * The +/- icon is the blueprint crosshair: the vertical stroke collapses when open.
 */
export function AccordionItem({ title, open, onToggle, children, id, markers = true }: { title: ReactNode; open: boolean; onToggle: () => void; children: ReactNode; id: string; markers?: boolean }) {
  return (
    <div className="relative border-b border-dotted border-fg/50">
      {markers && (
        <>
          <X at="bl" />
          <X at="br" />
        </>
      )}
      <h3>
        <button type="button" id={`${id}-btn`} aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle} className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-8">
          <span className={`text-[clamp(1.5rem,2.6vw,2.4rem)] leading-tight tracking-[-0.02em] transition-colors ${open ? 'text-head' : 'text-head/70 hover:text-head'}`}>{title}</span>
          <span aria-hidden className="relative block h-4 w-4 shrink-0 text-head">
            <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-current" />
            <span className={`absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-current transition-transform duration-300 ${open ? 'scale-y-0' : ''}`} />
          </span>
        </button>
      </h3>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.22,.61,.36,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className={`pb-8 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
