import Link from 'next/link';

/** Shown on protected pages when nobody is signed in. */
export default function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="wrap-sm py-16 text-center">
      <h1 className="h-page">Sign in required</h1>
      <p className="mt-1 text-[13px] text-mute">{message}</p>
      <div className="mt-5 flex items-center justify-center gap-4">
        <Link href="/login" className="btn-primary">
          Sign in
        </Link>
        <Link href="/register" className="link link-more text-[13px]">
          Create account
        </Link>
      </div>
    </div>
  );
}
