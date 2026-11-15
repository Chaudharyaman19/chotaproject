import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

// Fallback for non-Apple devices; Apple devices use the system font via the font stack.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'ShopEasy: Shop what you love', template: '%s | ShopEasy' },
  description: 'Beautifully made products at fair prices, with cash on delivery.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-white focus:px-3 focus:py-1.5 focus:text-sm focus:shadow-lg"
        >
          Skip to content
        </a>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
