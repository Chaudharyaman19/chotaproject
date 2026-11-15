const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function token() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

async function req(path: string, opts: RequestInit = {}) {
  const t = token();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(opts.headers || {}) },
    });
  } catch (e) {
    if (isAbort(e)) throw e; // callers rely on AbortError to ignore cancelled requests
    // Network failure / CORS block: the browser only says "Failed to fetch", which tells the user nothing.
    throw new Error('Can’t reach the server. Please check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // `opts.signal` lets callers cancel an in-flight request (AbortController).
  get: (p: string, opts?: RequestInit) => req(p, opts),
  post: (p: string, b: unknown) => req(p, { method: 'POST', body: JSON.stringify(b) }),
  put: (p: string, b: unknown) => req(p, { method: 'PUT', body: JSON.stringify(b) }),
  patch: (p: string, b: unknown) => req(p, { method: 'PATCH', body: JSON.stringify(b) }),
  del: (p: string) => req(p, { method: 'DELETE' }),
};
