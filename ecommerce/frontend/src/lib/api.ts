const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function token() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

async function req(path: string, opts: RequestInit = {}) {
  const t = token();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  get: (p: string) => req(p),
  post: (p: string, b: unknown) => req(p, { method: 'POST', body: JSON.stringify(b) }),
  put: (p: string, b: unknown) => req(p, { method: 'PUT', body: JSON.stringify(b) }),
  patch: (p: string, b: unknown) => req(p, { method: 'PATCH', body: JSON.stringify(b) }),
  del: (p: string) => req(p, { method: 'DELETE' }),
};
