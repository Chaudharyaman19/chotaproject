'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Field } from '../../components/ui/Field';
import AuthShell from '../../components/auth/AuthShell';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await register(name, email, password);
      router.push('/');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Join Apni Dukan" title="Create account" blurb="One account for your bag and orders. Takes ten seconds.">
      <form onSubmit={submit} className="mt-8 space-y-7 lg:mt-0">
        <Field id="name" label="Full name" autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        <Field id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="password" label="Password" hint="At least 6 characters" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && (
          <p role="alert" className="border border-danger/60 px-3 py-2 font-mono text-[12px] text-danger">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy || !name || !email || password.length < 6} className="pill-accent pill pill-lg w-full">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mono mt-8 text-center">
        Already have an account?{' '}
        <Link href="/login" className="link text-head">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
