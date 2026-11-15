import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SiteChrome from '../components/SiteChrome';
import SmoothScroll from '../components/SmoothScroll';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { THEME_INIT_SCRIPT, ThemeProvider } from '../context/ThemeContext';

/**
 * Typography: a tight neo-grotesk for display/UI and a monospace for body copy, buttons and labels.
 * (Both are free Google fonts chosen to match the look of the reference site's Untitled Sans + a mono.)
 */
const sans = Inter_Tight({ subsets: ['latin'], variable: '--font-sans', display: 'swap', weight: ['400', '500', '600'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: { default: 'Apni Dukan: Everyday objects, delivered', template: '%s | Apni Dukan' },
  description: 'A considered catalogue of everyday objects at fair prices. Pay in cash when it arrives.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#121314' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2 focus:font-mono focus:text-sm focus:text-onaccent">
          Skip to content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <SmoothScroll />
              <SiteChrome>{children}</SiteChrome>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
