import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '../../components/PageHero';
import { Reveal, SplitReveal, X } from '../../components/ui/Primitives';
import { Bars, DotField } from '../../components/ui/Viz';

export const metadata: Metadata = { title: 'About' };

export default function About() {
  return (
    <>
      <PageHero eyebrow="About ShopEasy" title="Objects, chosen with care">
        A small shop with a simple idea: sell fewer, better things, price them honestly, and get out of your way.
      </PageHero>

      <div className="wrap pb-10 pt-10">
        <div className="frame relative grid border-y border-dotted border-fg/50 md:grid-cols-2">
          <X at="tl" />
          <X at="tr" />
          <X at="bl" />
          <X at="br" />
          <div className="border-b border-dotted border-fg/50 p-6 md:border-b-0 md:border-r md:p-12">
            <p className="eyebrow">Our story</p>
            <p className="h3 mt-5 max-w-[22ch]">We got tired of shopping that felt like work.</p>
          </div>
          <div className="space-y-5 p-6 md:p-12">
            <p className="mono">Endless scrolling, hidden fees, checkout forms that ask for your whole life. We wanted a shop that respects your time: a focused catalogue, prices you can trust, and payment when your order shows up at the door.</p>
            <p className="mono">So that’s what ShopEasy is. Every product is chosen to earn its place, every price is the price, and every order is cash on delivery. If you change your mind, cancelling a pending order takes one click.</p>
          </div>
        </div>
      </div>

      <section className="tone-steel bg-bg text-fg">
        <div className="wrap">
          <div className="frame relative grid md:grid-cols-3">
            {[
              { t: 'Curated, not crowded', d: 'A focused catalogue across clothing, footwear, accessories, electronics, beauty, home and sport.', viz: <Bars className="w-full" /> },
              { t: 'Honest by default', d: 'Clear prices, visible delivery costs, live stock counts and no surprises at the door.', viz: <DotField className="h-[120px] w-full" /> },
              { t: 'People, not tickets', d: 'Messages are read by real people who can actually fix the problem.', viz: <Bars className="w-full" /> },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 100} className={`relative flex min-h-[380px] flex-col justify-between gap-10 p-6 md:p-10 ${i ? 'border-t border-dotted border-fg/50 md:border-l md:border-t-0' : ''}`}>
                <X at="tl" />
                <div className="opacity-90">{v.viz}</div>
                <div>
                  <h2 className="text-[1.9rem] font-medium uppercase leading-[0.98] tracking-[-0.04em] text-head">{v.t}</h2>
                  <p className="mono mt-4">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="tone-accent bg-bg py-20 text-fg md:py-28">
        <div className="wrap">
          <SplitReveal text="Come have a look." as="h2" className="display max-w-[10ch]" />
          <Reveal delay={200} className="mt-10 flex flex-wrap gap-3">
            <Link href="/products" className="pill pill-lg !border-[#121314] !text-[#121314] before:!bg-[#121314] hover:!text-[#d591fe]">
              Shop the catalogue
            </Link>
            <Link href="/contact" className="pill pill-lg !border-[#121314] !text-[#121314] before:!bg-[#121314] hover:!text-[#d591fe]">
              Contact us
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
