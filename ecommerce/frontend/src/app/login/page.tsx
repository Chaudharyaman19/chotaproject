'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Field } from '../../components/ui/Field';
import AuthShell from '../../components/auth/AuthShell';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in" blurb="Pick up where you left off: your bag, your orders, your details.">
      <form onSubmit={submit} className="mt-8 space-y-7 lg:mt-0">
        <Field id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="password" label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && (
          <p role="alert" className="border border-danger/60 px-3 py-2 font-mono text-[12px] text-danger">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy || !email || !password} className="pill-accent pill pill-lg w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mono mt-8 text-center">
        New here?{' '}
        <Link href="/register" className="link text-head">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
