'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Field } from '../../components/Field';

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
    <div className="mx-auto w-full max-w-[340px] px-4 py-12">
      <h1 className="h-page text-center">Sign in</h1>
      <p className="mt-1 text-center text-[13px] text-mute">Welcome back to ShopEasy.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <Field id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="password" label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && (
          <p role="alert" className="rounded-md bg-[#fff1f0] px-3 py-2 text-xs text-[#c4271b]">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy || !email || !password} className="btn-primary !mt-4 w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-mute">
        Don’t have an account?{' '}
        <Link href="/register" className="link font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
