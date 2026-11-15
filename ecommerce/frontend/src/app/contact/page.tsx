'use client';
import { FormEvent, useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '../../lib/api';
import PageHero from '../../components/PageHero';
import { Field, TextAreaField } from '../../components/ui/Field';
import { X } from '../../components/ui/Primitives';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [err, setErr] = useState('');
  const valid = form.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(form.email) && form.message.trim().length >= 5;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || state === 'busy') return;
    setErr('');
    setState('busy');
    try {
      await api.post('/messages', { kind: 'CONTACT', ...form, subject: form.subject || undefined });
      setState('done');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
      setState('idle');
    }
  };

  return (
    <>
      <PageHero eyebrow="Get in touch" title="Say hello">
        Questions about an order, a product or anything else? Write to us and we’ll reply by email.
      </PageHero>
      <div className="wrap pb-24 pt-10">
        <div className="frame relative grid border-y border-dotted border-fg/50 lg:grid-cols-[1fr_1.4fr]">
          <X at="tl" />
          <X at="tr" />
          <X at="bl" />
          <X at="br" />
          <div className="space-y-8 border-b border-dotted border-fg/50 p-6 md:p-10 lg:border-b-0 lg:border-r">
            <div>
              <p className="eyebrow">Orders</p>
              <p className="mono mt-2 max-w-[34ch]">Include your order number so we can find it quickly. You can see it on your Orders page.</p>
            </div>
            <div>
              <p className="eyebrow">Replies</p>
              <p className="mono mt-2 max-w-[34ch]">We answer by email, as soon as we can.</p>
            </div>
            <div>
              <p className="eyebrow">Payment</p>
              <p className="mono mt-2 max-w-[34ch]">Cash on delivery. We never ask for card details, by email or otherwise.</p>
            </div>
          </div>

          <div className="p-6 md:p-10">
            {state === 'done' ? (
              <div role="status" className="flex h-full min-h-[320px] flex-col items-start justify-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-onaccent">
                  <Check size={22} />
                </span>
                <h2 className="h3 mt-6">Message sent.</h2>
                <p className="mono mt-2">Thanks for reaching out. We’ll reply to {form.email} soon.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-x-8 gap-y-7 sm:grid-cols-2" noValidate>
                <Field id="c-name" label="Name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Field id="c-email" label="Email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Field id="c-subject" label="Subject (optional)" className="sm:col-span-2" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <TextAreaField id="c-msg" label="Message" rows={5} className="sm:col-span-2" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                {err && (
                  <p role="alert" className="border border-danger/60 px-3 py-2 font-mono text-[12px] text-danger sm:col-span-2">
                    {err}
                  </p>
                )}
                <div className="sm:col-span-2">
                  <button type="submit" disabled={!valid || state === 'busy'} className="pill-accent pill pill-lg">
                    {state === 'busy' ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
