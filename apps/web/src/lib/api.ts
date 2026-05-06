const base =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1')
    : '';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pluginai_token');
}

export function setToken(token: string) {
  localStorage.setItem('pluginai_token', token);
}

export function clearToken() {
  localStorage.removeItem('pluginai_token');
}

export async function api<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (init?.auth !== false) {
    const t = getToken();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg =
      typeof body?.message === 'string'
        ? body.message
        : Array.isArray(body?.message)
          ? body.message.join(', ')
          : res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return body as T;
}
