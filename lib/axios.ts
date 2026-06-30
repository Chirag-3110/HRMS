import axios from 'axios';
import { getSession } from 'next-auth/react';

/**
 * Axios instance configured for API requests
 */
export const apiClient = axios.create({
  // Relative base URL — no CORS issues on any host (localhost, production, staging).
  // Browser uses the current origin automatically.
  baseURL: '/api',
  timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Session cache to avoid calling getSession() on every request.
 * NextAuth uses JWT strategy so the token is in the cookie — no server
 * round-trip needed once we have it. We cache it for 5 minutes.
 */
let cachedAccessToken: string | null = null;
let tokenCacheExpiry = 0;
const TOKEN_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

async function getCachedAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedAccessToken && now < tokenCacheExpiry) {
    return cachedAccessToken;
  }
  const session = await getSession();
  cachedAccessToken = (session as any)?.accessToken ?? null;
  tokenCacheExpiry = now + TOKEN_CACHE_DURATION_MS;
  return cachedAccessToken;
}

/** Call this when session is invalidated (e.g. logout) */
export function clearSessionCache(): void {
  cachedAccessToken = null;
  tokenCacheExpiry = 0;
}

/**
 * Request interceptor — attaches auth token from cached session
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getCachedAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — handles 401 and dev-mode error logging
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearSessionCache();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=SessionExpired';
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    return Promise.reject(error);
  }
);
