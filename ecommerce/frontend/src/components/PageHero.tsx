import { ReactNode } from 'react';
import { SplitReveal, Reveal, X } from './ui/Primitives';

/** Title block used at the top of every inner page. */
export default function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="wrap pt-32 md:pt-44">
      <div className="frame relative border-b border-dotted border-fg/50 pb-10 pt-2 md:pb-14">
        <X at="bl" />
        <X at="br" />
        <div className="px-5 md:px-10">
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <SplitReveal text={title} as="h1" className="display mt-5" />
          {children && (
            <Reveal delay={150} className="mt-6 max-w-xl font-mono text-[13px] leading-7">
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
