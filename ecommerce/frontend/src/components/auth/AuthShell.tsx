import { ReactNode } from 'react';
import { X } from '../ui/Primitives';

/** Split screen for sign-in / register: accent panel with a big statement + the form. */
export default function AuthShell({ eyebrow, title, blurb, children }: { eyebrow: string; title: string; blurb: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen pt-[72px] lg:grid-cols-2">
      <div className="tone-accent relative hidden overflow-hidden bg-bg text-fg lg:block">
        <div className="absolute inset-[4vh_3vw] border border-dotted border-fg/60">
          <X at="tl" /> <X at="tr" /> <X at="bl" /> <X at="br" />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end p-[7vw] pb-[12vh]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-4" style={{ fontSize: 'clamp(3rem,6.4vw,6.8rem)' }}>
            {title}
          </h1>
          <p className="mono mt-6 max-w-[34ch]">{blurb}</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[420px]">
          <p className="eyebrow lg:hidden">{eyebrow}</p>
          <h1 className="h2 mt-3 lg:hidden">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
