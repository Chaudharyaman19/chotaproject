'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Banknote, RotateCcw, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { CATEGORY_BLURBS, FAQ } from '../lib/content';
import { formatPrice } from '../lib/format';
import { prefersReducedMotion, refreshScrollTriggers, registerGsap } from '../lib/gsap';
import { Product } from '../types';
import ProductCard, { isPhoto } from '../components/ProductCard';
import { ErrorState, ProductGridSkeleton } from '../components/Loading';
import HeroCanvas from '../components/home/HeroCanvas';
import Stack3D from '../components/home/Stack3D';
import { AccordionItem } from '../components/ui/Accordion';
import { Counter, Marquee, Reveal, SplitReveal, X } from '../components/ui/Primitives';
import { Bars, DotField, Dashes, Waves } from '../components/ui/Viz';

/* ------------------------------------------------------------------ hero */
function Hero({ picks }: { picks: Product[] }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      gsap.set('[data-hl]', { yPercent: 115 });
      gsap.set('[data-fade]', { opacity: 0, y: 24 });
      gsap
        .timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 })
        .to('[data-hl]', { yPercent: 0, duration: 1.2, stagger: 0.09 })
        .to('[data-fade]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.7');
      // Scroll: headline drifts up and the product plates parallax at different speeds.
      gsap.to('[data-parallax="head"]', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.utils.toArray<HTMLElement>('[data-plate]').forEach((el, i) =>
        gsap.to(el, { y: -80 - i * 90, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      );
    }, root);
    return () => ctx.revert();
  }, []);

  const Line = ({ children, className = '' }: { children: string; className?: string }) => (
    <span className={`block overflow-hidden pb-[0.06em] ${className}`}>
      <span data-hl className="block will-change-transform">
        {children}
      </span>
    </span>
  );

  return (
    <section ref={root} className="relative min-h-[100svh] overflow-hidden">
      <HeroCanvas />
      <div className="wrap relative z-10 flex min-h-[100svh] flex-col justify-between pb-10 pt-28 md:pb-14">
        <h1 data-parallax="head" className="display max-w-[16ch]">
          <Line>Everyday</Line>
          <Line className="md:ml-[9vw]">objects</Line>
          <Line>worth</Line>
          <Line>keeping.</Line>
        </h1>

        {picks.slice(0, 2).map((p, i) => (
          <div key={p._id} data-plate className={`absolute hidden md:block ${i === 0 ? 'right-[24vw] top-[17vh] w-[15vw] min-w-[170px] max-w-[250px]' : 'right-[7vw] top-[30vh] w-[12vw] min-w-[140px] max-w-[210px]'}`}>
            <Link href={`/products/${p._id}`} data-fade className="shot relative block aspect-[4/5] overflow-hidden border border-dotted border-fg/60">
              <img src={p.image} alt={p.name} className={`h-full w-full ${isPhoto(p.image) ? 'object-cover' : 'object-contain p-4'}`} />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#121314]/85 px-3 py-2 font-mono text-[11px] text-[#d591fe]">
                <span className="truncate pr-2">{p.name}</span>
                <span>{formatPrice(p.price)}</span>
              </span>
            </Link>
          </div>
        ))}

        <div className="mt-16 flex flex-col items-start gap-8 md:mt-0 md:items-end">
          <p data-parallax="head" className="display text-left md:text-right" style={{ fontSize: 'clamp(2.1rem, 6.2vw, 5.8rem)' }}>
            <Line className="md:text-right">For home,</Line>
            <Line className="md:text-right">work, and play.</Line>
          </p>
          <div className="flex w-full flex-col-reverse items-start justify-between gap-8 md:flex-row md:items-end">
            <div data-fade className="flex flex-wrap items-center gap-3">
              <Link href="/products" className="pill-fat pill">
                Shop now <ArrowRight size={16} />
              </Link>
              <Link href="/products?featured=true" className="pill pill-lg">
                Featured picks
              </Link>
            </div>
            <p data-fade className="mono max-w-[300px] text-fg">
              A considered catalogue of everyday objects, priced fairly and delivered to your door. Pay in cash when it arrives.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ statement (pinned) */
function Statement({ image }: { image?: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      if (image) tl.fromTo('[data-st-img]', { scale: 0.55, rotate: -6, opacity: 0.2 }, { scale: 1.05, rotate: 0, opacity: 1 }, 0);
      tl.fromTo('[data-st-head]', { scale: 0.82 }, { scale: 1 }, 0)
        .fromTo('[data-st-l]', { x: -60, opacity: 0 }, { x: 0, opacity: 1 }, 0.1)
        .fromTo('[data-st-r]', { x: 60, opacity: 0 }, { x: 0, opacity: 1 }, 0.1);
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, animation: tl });
    }, root);
    return () => ctx.revert();
  }, [image]);

  return (
    <section ref={root} className="tone-accent relative h-[100svh] overflow-hidden bg-bg text-fg">
      <div className="absolute inset-[4vh_4vw] border border-dotted border-fg/60">
        <X at="tl" /> <X at="tr" /> <X at="bl" /> <X at="br" />
      </div>
      {image && (
        <img data-st-img src={image} alt="" className="absolute left-1/2 top-1/2 h-[62vh] w-[62vh] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 object-contain mix-blend-multiply [filter:grayscale(1)_contrast(1.35)]" />
      )}
      <div className="relative z-10 grid h-full place-items-center">
        <div className="flex w-full max-w-[1480px] items-center justify-between px-[8vw]">
          <p data-st-l className="mono hidden w-40 text-fg md:block">Everyday objects</p>
          <h2 data-st-head className="display text-center" style={{ fontSize: 'clamp(2.8rem, 9vw, 9rem)' }}>
            We curated it
          </h2>
          <p data-st-r className="mono hidden w-40 text-right text-fg md:block">deserve better.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ layers */
function Layer({ title, lead, left, right, viz, vizClass = '' }: { title: string; lead: string; left: string; right: string; viz: React.ReactNode; vizClass?: string }) {
  return (
    <div className="relative">
      <Cell className="px-5 pb-6 pt-10 md:px-10 md:pb-10 md:pt-16">
        <SplitReveal text={title} as="h2" className="h2 max-w-[14ch]" />
      </Cell>
      <div className="grid md:grid-cols-2">
        <Cell className="rule-t px-5 py-8 md:px-10 md:py-12">
          <Reveal>
            <p className="h3 max-w-[22ch]">{lead}</p>
          </Reveal>
        </Cell>
        <Cell className="rule-t rule-l hidden px-10 py-12 md:flex md:items-center">
          <Dashes className="w-full" />
        </Cell>
      </div>
      <div className="grid md:grid-cols-[2fr_1fr_1fr]">
        <Cell className={`rule-t flex items-center px-5 py-8 md:px-10 md:py-12 ${vizClass}`}>{viz}</Cell>
        <Cell className="rule-t rule-l px-5 py-8 md:px-10 md:py-12">
          <p className="mono text-justify">{left}</p>
        </Cell>
        <Cell className="rule-t rule-l px-5 py-8 md:px-10 md:py-12">
          <p className="mono text-justify">{right}</p>
        </Cell>
      </div>
    </div>
  );
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <X at="tl" />
      <X at="tr" />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ page */
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [openCat, setOpenCat] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    api
      .get('/products?limit=500')
      .then((d) => setProducts(d.products ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);
  // Product grids and the category list change the page height once data arrives.
  useEffect(() => {
    if (!loading) refreshScrollTriggers(300);
  }, [loading]);

  const featured = useMemo(() => {
    const f = products.filter((p) => p.featured && p.stock > 0);
    return (f.length >= 4 ? f : products).slice(0, 8);
  }, [products]);

  const cats = useMemo(() => {
    const m = new Map<string, { name: string; count: number; from: number; product?: Product }>();
    for (const p of products) {
      const c = m.get(p.category) ?? { name: p.category, count: 0, from: Infinity, product: undefined };
      c.count += 1;
      c.from = Math.min(c.from, p.price);
      if (!c.product || (p.featured && !c.product.featured)) c.product = p;
      m.set(p.category, c);
    }
    return Array.from(m.values());
  }, [products]);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[])).slice(0, 28), [products]);
  const avgRating = useMemo(() => {
    const r = products.filter((p) => (p.rating ?? 0) > 0);
    return r.length ? r.reduce((s, p) => s + (p.rating ?? 0), 0) / r.length : 0;
  }, [products]);

  const heroPicks = useMemo(() => featured.filter((p) => p.image).slice(0, 2), [featured]);
  const statementImg = featured[2]?.image ?? featured[0]?.image;

  return (
    <>
      <Hero picks={heroPicks} />

      {/* brand ticker */}
      <section className="border-y border-dotted border-fg/50 py-5">
        <Marquee speed={60}>
          {(brands.length ? brands : ['Curated', 'Everyday', 'Objects', 'Delivered']).map((b, i) => (
            <span key={`${b}-${i}`} className="flex items-center whitespace-nowrap px-8 text-[clamp(1.2rem,2vw,1.8rem)] font-medium uppercase tracking-[-0.02em] text-head/80">
              {b}
              <span className="ml-16 text-accentfg">+</span>
            </span>
          ))}
        </Marquee>
      </section>

      <Statement image={statementImg} />

      {/* layers + catalogue */}
      <section className="tone-steel bg-bg text-fg">
        <div className="wrap">
          <div className="frame relative">
            <Layer
              title="Selection layer"
              lead="One catalogue. Every category you actually need."
              left="We choose products the way a good shop does: fewer, better, and judged on how people really use them. Every listing has clear photos, an honest description and a price that is the price."
              right="Stock is tracked live, so what you see is what ships. If something sells out it says so: no waiting, no surprise emails, no substitutions."
              viz={<Bars className="w-full" />}
            />
            <Layer
              title="Delivery layer"
              lead="From our shelf to your door, with nothing to prepay."
              left="Order in a few taps and pay in cash when it arrives. No card details, no accounts to link, no hidden fees at the door."
              right="Free delivery on orders over $50. Below that, a flat $4.99 is shown in your bag before you place the order."
              viz={<Waves className="w-full" />}
            />
            <Layer
              title="Returns layer"
              lead="Changed your mind? We make it painless."
              left="Cancel a pending order yourself from your orders page and the stock goes straight back on the shelf. No forms, no emails."
              right="Something not right on arrival? Message us with your order number and we will make it right."
              viz={<DotField className="h-[160px] w-full" />}
            />

            {/* the catalogue accordion */}
            <div className="relative rule-t">
              <Cell className="px-5 pb-6 pt-10 md:px-10 md:pb-10 md:pt-16">
                <SplitReveal text="The catalogue" as="h2" className="h2" />
              </Cell>
              <div className="grid md:grid-cols-2">
                <Cell className="rule-t px-5 py-8 md:px-10 md:py-12">
                  <p className="h3 max-w-[16ch]">One place for every need.</p>
                </Cell>
                <Cell className="rule-t rule-l px-5 py-8 md:px-10 md:py-12">
                  <p className="h3">Clothing that fits, footwear that lasts, electronics worth plugging in and objects for home and desk. Browse by collection or search the lot.</p>
                </Cell>
              </div>
              <div className="grid md:grid-cols-2">
                <Cell className="rule-t hidden items-center justify-center px-6 py-14 md:flex">
                  <Stack3D items={cats.map((c) => ({ label: c.name, product: c.product }))} active={openCat} />
                </Cell>
                <div className="rule-t md:rule-l">
                  {loading ? (
                    <div className="space-y-px p-10">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="skeleton mb-4 h-10 w-2/3" />
                      ))}
                    </div>
                  ) : (
                    cats.map((c, i) => (
                      <div key={c.name} className="px-5 md:px-10">
                        <AccordionItem id={`cat-${i}`} open={openCat === i} onToggle={() => { setOpenCat(openCat === i ? -1 : i); refreshScrollTriggers(650); }} title={c.name}>
                          <p className="mono max-w-[56ch]">{CATEGORY_BLURBS[c.name] ?? 'Hand-picked products in this collection.'}</p>
                          <p className="eyebrow mt-4">
                            {c.count} products · from {formatPrice(c.from)}
                          </p>
                          <Link href={`/products?category=${encodeURIComponent(c.name)}`} className="pill mt-6">
                            Explore {c.name} <ArrowUpRight size={14} />
                          </Link>
                        </AccordionItem>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* featured */}
      <section className="py-16 md:py-28">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SplitReveal text="Featured" as="h2" className="h2" />
            <Reveal className="flex items-center gap-4">
              <span className="eyebrow">{featured.length} hand-picked</span>
              <Link href="/products" className="pill pill-sm">
                View all <ArrowUpRight size={13} />
              </Link>
            </Reveal>
          </div>
          {loading ? (
            <ProductGridSkeleton count={8} className="grid-cols-2 lg:grid-cols-4" />
          ) : err ? (
            <ErrorState message={err} onRetry={load} />
          ) : products.length === 0 ? (
            <p className="py-16 text-center font-mono text-[13px]">No products yet. Run the seed script to add some.</p>
          ) : (
            <div className="grid grid-cols-2 border-l border-t border-dotted border-fg/50 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p._id} p={p} className="border-b border-r border-dotted border-fg/50" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* numbers + promise */}
      <section className="tone-ink bg-bg text-fg">
        <div className="wrap">
          <div className="frame relative grid md:grid-cols-2">
            <Cell className="px-5 py-12 md:px-10 md:py-20">
              <SplitReveal text="Built around the day-to-day, not the hype." as="h2" className="h2" />
            </Cell>
            <div className="rule-t md:rule-l md:border-t-0">
              <Cell className="px-5 py-10 md:px-10 md:py-14">
                <p className="eyebrow">By the numbers</p>
                <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-10">
                  {[
                    { to: products.length, label: 'products in the catalogue', suffix: '' },
                    { to: cats.length, label: 'collections to browse', suffix: '' },
                    { to: Number(avgRating.toFixed(1)), label: 'average product rating', suffix: '', decimals: 1 },
                    { to: 50, label: 'free delivery from', prefix: '$', suffix: '' },
                  ].map((s) => (
                    <div key={s.label}>
                      <dd className="text-[clamp(2.4rem,4.4vw,3.8rem)] font-medium leading-none tracking-[-0.04em] text-head">
                        <Counter to={s.to} decimals={s.decimals ?? 0} prefix={s.prefix ?? ''} suffix={s.suffix} />
                      </dd>
                      <dt className="mono mt-3">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              </Cell>
              <div className="grid grid-cols-[1fr_auto] md:grid-cols-2">
                <Cell className="rule-t flex flex-col justify-between gap-8 px-5 py-8 md:px-10">
                  <p className="mono">“We would rather sell you one thing you keep than five you send back.”</p>
                  <p className="mono text-head">The ShopEasy team</p>
                </Cell>
                <Link href="/products" className="group relative flex min-h-[200px] flex-col justify-between bg-accent p-6 text-onaccent">
                  <span className="flex items-start justify-between font-mono text-[13px]">
                    Start your first
                    <ArrowUpRight size={26} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </span>
                  <span className="text-[1.9rem] leading-none tracking-[-0.03em]">Order</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="py-16 md:py-28">
        <div className="wrap">
          <SplitReveal text="How it works" as="h2" className="h2" />
          <div className="mt-12 grid border-l border-t border-dotted border-fg/50 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '01', t: 'Browse', d: 'Explore collections or search by name, brand or category.' },
              { n: '02', t: 'Add to bag', d: 'Pick your items and quantities. See your total before anything else.' },
              { n: '03', t: 'Place the order', d: 'Sign in, add a delivery address and confirm. That is it.' },
              { n: '04', t: 'Pay on delivery', d: 'Pay the courier in cash when your parcel arrives.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="relative flex min-h-[260px] flex-col justify-between border-b border-r border-dotted border-fg/50 p-6 md:p-8">
                <X at="tr" />
                <span className="font-mono text-[13px] text-accentfg">{s.n}</span>
                <div>
                  <h3 className="text-[2rem] font-medium uppercase leading-none tracking-[-0.04em] text-head">{s.t}</h3>
                  <p className="mono mt-3 max-w-[28ch]">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* compare */}
      <section className="tone-steel bg-bg text-fg">
        <div className="wrap">
          <div className="frame relative">
            <Cell className="px-5 pb-6 pt-10 md:px-10 md:pt-16">
              <SplitReveal text="Our approach vs. the usual" as="h2" className="h2 max-w-[16ch]" />
            </Cell>
            <div className="grid md:grid-cols-2">
              {[
                { h: 'With ShopEasy', icon: ShieldCheck, rows: ['Cash on delivery, no card needed', 'Free delivery over $50', 'Cancel pending orders in one click', 'Live stock counts on every product'] },
                { h: 'The usual online store', icon: Banknote, rows: ['Card details required up front', 'Delivery fees from the first item', 'Cancel by emailing support', 'Surprise out-of-stock emails'], dim: true },
              ].map((col, ci) => (
                <Cell key={col.h} className={`rule-t px-5 py-8 md:px-10 md:py-12 ${ci ? 'md:rule-l' : ''}`}>
                  <p className={`eyebrow ${col.dim ? 'opacity-60' : ''}`}>{col.h}</p>
                  <ul className="mt-6 divide-y divide-dotted divide-fg/50">
                    {col.rows.map((r) => (
                      <li key={r} className={`flex items-center gap-3 py-4 text-[clamp(1.1rem,1.6vw,1.5rem)] tracking-[-0.01em] text-head ${col.dim ? 'opacity-55 line-through decoration-1' : ''}`}>
                        <col.icon size={18} className="shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </Cell>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* principles */}
      <section className="py-16 md:py-28">
        <div className="wrap">
          <SplitReveal text="What we stand for" as="h2" className="h2" />
          <div className="mt-12 grid border-l border-t border-dotted border-fg/50 md:grid-cols-3">
            {[
              { icon: ShieldCheck, t: 'Curated, not crowded', d: 'A focused catalogue where every item earns its place, so you spend less time scrolling and more time choosing.' },
              { icon: Banknote, t: 'Honest pricing', d: 'The price you see is the price you pay. Delivery costs are shown before you order, and payment is on delivery.' },
              { icon: RotateCcw, t: 'Human support', d: 'Real people read every message. Tell us what went wrong and we will fix it, not send you to a help-centre maze.' },
            ].map(({ icon: Icon, t, d }, i) => (
              <Reveal key={t} delay={i * 100} className="relative border-b border-r border-dotted border-fg/50 p-6 md:p-10">
                <X at="tr" />
                <Icon size={30} strokeWidth={1.2} className="text-accentfg" />
                <h3 className="mt-16 text-[1.9rem] leading-[1.05] tracking-[-0.03em] text-head">{t}</h3>
                <p className="mono mt-4">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* closing CTA */}
      <section className="tone-accent relative overflow-hidden bg-bg py-20 text-fg md:py-32">
        <div className="wrap relative z-10">
          <SplitReveal text="Good things, delivered." as="h2" className="display max-w-[12ch]" />
          <Reveal delay={200} className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/products" className="pill pill-lg !border-[#121314] !text-[#121314] before:!bg-[#121314] hover:!text-[#d591fe]">
              Shop the catalogue <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="pill pill-lg !border-[#121314] !text-[#121314] before:!bg-[#121314] hover:!text-[#d591fe]">
              Talk to us
            </Link>
          </Reveal>
        </div>
      </section>

      {/* faq */}
      <section className="py-16 md:py-28">
        <div className="wrap">
          <div className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
            <div>
              <SplitReveal text="Questions, answered" as="h2" className="h2" />
              <Link href="/faq" className="pill mt-8">
                All FAQs <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="border-t border-dotted border-fg/50">
              {FAQ.slice(0, 6).map((f, i) => (
                <AccordionItem key={f.q} id={`faq-${i}`} title={f.q} open={openFaq === i} onToggle={() => { setOpenFaq(openFaq === i ? -1 : i); refreshScrollTriggers(650); }} markers={false}>
                  <p className="mono max-w-[62ch]">{f.a}</p>
                </AccordionItem>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
