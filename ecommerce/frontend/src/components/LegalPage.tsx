import { ReactNode } from 'react';
import PageHero from './PageHero';
import { X } from './ui/Primitives';

export interface Section { h: string; p: ReactNode[] }

/** Long-form text page (shipping, privacy, terms) laid out on the blueprint grid. */
export default function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro?: string; sections: Section[] }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title}>
        {intro}
      </PageHero>
      <div className="wrap pb-24 pt-10">
        <div className="frame relative border-y border-dotted border-fg/50">
          <X at="tl" />
          <X at="tr" />
          <X at="bl" />
          <X at="br" />
          {sections.map((s, i) => (
            <section key={s.h} className={`grid gap-4 p-6 md:grid-cols-[280px_1fr] md:gap-10 md:p-10 ${i ? 'border-t border-dotted border-fg/50' : ''}`}>
              <h2 className="text-[1.5rem] font-medium leading-tight tracking-[-0.02em] text-head">
                <span className="mono mr-3 text-accentfg">{String(i + 1).padStart(2, '0')}</span>
                {s.h}
              </h2>
              <div className="space-y-4">
                {s.p.map((para, k) => (
                  <p key={k} className="mono max-w-[70ch]">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
