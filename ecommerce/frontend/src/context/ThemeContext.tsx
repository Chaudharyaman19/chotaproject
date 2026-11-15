'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

interface Ctx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const C = createContext<Ctx>({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

/** Inline in <head> (see layout.tsx) so the right theme is painted before React hydrates: no flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Sync with whatever the init script already applied.
  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') setThemeState(t);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
    try {
      localStorage.setItem('theme', t);
    } catch {}
  }, []);

  const toggle = useCallback(() => setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'), [setTheme]);

  return <C.Provider value={{ theme, toggle, setTheme }}>{children}</C.Provider>;
}

export const useTheme = () => useContext(C);
