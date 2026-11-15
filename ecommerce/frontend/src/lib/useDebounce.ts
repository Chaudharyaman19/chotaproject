import { useEffect, useState } from 'react';

/**
 * Debounce: returns `value` only after it has stopped changing for `delay` ms.
 *
 * Why: without it, typing "headphones" in a search box fires 10 API calls (one per
 * keystroke). With it, we fire one call ~350ms after the user pauses. Pair it with an
 * AbortController in the fetching effect so a slow, stale response can never overwrite
 * a newer one.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t); // reset the timer on every change
  }, [value, delay]);
  return debounced;
}
