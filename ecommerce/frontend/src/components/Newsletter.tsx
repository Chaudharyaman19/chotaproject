'use client';
import { FormEvent, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { api } from '../lib/api';

/** Newsletter signup: POSTs to /api/messages (kind NEWSLETTER); duplicates are fine server-side. */
export default function Newsletter({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [err, setErr] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === 'busy') return;
    setErr('');
    setState('busy');
    try {
      await api.post('/messages', { kind: 'NEWSLETTER', email: email.trim() });
      setState('done');
      setEmail('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
      setState('idle');
    }
  };

  if (state === 'done')
    return (
      <p className={`inline-flex items-center gap-2 font-mono text-[13px] text-accentfg ${className}`} role="status">
        <Check size={15} /> You’re on the list. Welcome aboard.
      </p>
    );

  return (
    <form onSubmit={submit} className={className} noValidate>
      <label htmlFor="nl-email" className="sr-only">
        Email address
      </label>
      <div className="flex items-center gap-3 border-b border-dotted border-fg/60 focus-within:border-solid focus-within:border-accentfg">
        <input
          id="nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className="h-12 w-full bg-transparent font-mono text-[14px] text-head outline-none placeholder:text-fg/50"
        />
        <button type="submit" disabled={state === 'busy' || !/^\S+@\S+\.\S+$/.test(email)} aria-label="Subscribe" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-onaccent transition-opacity disabled:opacity-40">
          <ArrowRight size={16} />
        </button>
      </div>
      {err && (
        <p role="alert" className="mt-2 font-mono text-[12px] text-danger">
          {err}
        </p>
      )}
    </form>
  );
}
