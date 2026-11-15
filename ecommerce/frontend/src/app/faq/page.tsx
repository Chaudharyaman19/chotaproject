'use client';
import { useState } from 'react';
import Link from 'next/link';
import PageHero from '../../components/PageHero';
import { AccordionItem } from '../../components/ui/Accordion';
import { FAQ } from '../../lib/content';

export default function FaqPage() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHero eyebrow="Help" title="Questions, answered">
        Can’t find what you need? Send us a message and a real person will reply.
      </PageHero>
      <div className="wrap pb-24 pt-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr]">
          <div>
            <Link href="/contact" className="pill-accent pill pill-lg">
              Contact us
            </Link>
          </div>
          <div className="border-t border-dotted border-fg/50">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} id={`faq-${i}`} title={f.q} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} markers={false}>
                <p className="mono max-w-[62ch]">{f.a}</p>
              </AccordionItem>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
