import Link from 'next/link';

const links: [string, string][] = [
  ['/products', 'Shop'],
  ['/cart', 'Bag'],
  ['/orders', 'Orders'],
  ['/login', 'Sign in'],
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line text-xs text-mute">
      <div className="wrap flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-ink">ShopEasy</span> · © 2026 · Cash on delivery on every order
        </p>
        <ul className="flex gap-4">
          {links.map(([href, label]) => (
            <li key={label}>
              <Link href={href} className="hover:text-ink hover:underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
