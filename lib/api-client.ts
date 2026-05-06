/**
 * api-client.ts
 * Shared helper for calling the backend. Resolves the base URL from
 * NEXT_PUBLIC_UMA_API_URL (e.g. http://127.0.0.1:8000) and appends `/api`.
 * Reads 'access_token' from localStorage and injects the Bearer header.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import ServerAddress from "@/constent/ServerAddress";

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

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      window.location.href = '/auth/login';
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    const detail = error.response?.data?.detail || `API error ${error.response?.status || ''}`;
    return Promise.reject(new Error(detail));
  }
);

/**
 * Authenticated axios helper.
 * Throws an Error with `message` = the API detail string on non-2xx responses.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const url = path.startsWith('http') ? path : `${ServerAddress}${path}`;

  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
    data: body,
  };

  const response: AxiosResponse<T> = await axiosInstance.request(config);
  return response.data;
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
