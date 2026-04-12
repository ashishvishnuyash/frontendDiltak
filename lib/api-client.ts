/**
 * api-client.ts
 * Shared helper for calling the animeshai backend at http://74.162.66.197/api
 * Reads 'access_token' from localStorage and injects the Bearer header.
 */

export const API_BASE = 'http://74.162.66.197/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Additional headers to merge */
  headers?: Record<string, string>;
}

/**
 * Authenticated fetch helper.
 * Throws an Error with `message` = the API detail string on non-2xx responses.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token = getToken();
  const { method = 'GET', body, headers = {} } = options;

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, init);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      // Token expired or invalid — clear auth and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      window.location.href = '/auth/login';
      throw new Error('Session expired. Please log in again.');
    }
    let detail = `API error ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.detail ?? detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const apiGet = <T>(path: string) => apiRequest<T>(path);
export const apiPost = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: 'POST', body });
export const apiPatch = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: 'PATCH', body });
export const apiPut = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: 'PUT', body });
export const apiDelete = <T>(path: string) =>
  apiRequest<T>(path, { method: 'DELETE' });
