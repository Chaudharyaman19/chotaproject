'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Field } from '../../components/Field';

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
    <div className="mx-auto w-full max-w-[340px] px-4 py-12">
      <h1 className="h-page text-center">Create account</h1>
      <p className="mt-1 text-center text-[13px] text-mute">One account for your bag and orders.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <Field id="name" label="Full name" autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        <Field id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field id="password" label="Password (min 6 characters)" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && (
          <p role="alert" className="rounded-md bg-[#fff1f0] px-3 py-2 text-xs text-[#c4271b]">
            {err}
          </p>
        )}
        <button type="submit" disabled={busy || !name || !email || password.length < 6} className="btn-primary !mt-4 w-full">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-mute">
        Already have an account?{' '}
        <Link href="/login" className="link font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
