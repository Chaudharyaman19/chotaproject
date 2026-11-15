import Link from 'next/link';

/** Shown on protected pages when nobody is signed in. */
export default function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="wrap-sm flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow">Members only</p>
      <h1 className="h2 mt-4">Sign in required</h1>
      <p className="mt-4 font-mono text-[13px]">{message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/login" className="pill-accent pill">
          Sign in
        </Link>
        <Link href="/register" className="pill">
          Create account
        </Link>
      </div>
    </div>
  );
}
