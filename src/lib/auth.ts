/**
 * HinchMart Seller Auth Utility
 *
 * Centralizes token management and provides `authFetch()` as a drop-in
 * replacement for `fetch()` that silently refreshes access tokens on expiry.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ACCESS_KEY = 'seller_token';
const REFRESH_KEY = 'seller_refresh_token';

// ─── Token Getters/Setters ────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  // Also keep cookie in sync for Next.js middleware
  document.cookie = `${ACCESS_KEY}=${accessToken}; path=/; max-age=900; samesite=lax;`; // 15min
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem('seller_info');
  // Expire cookie
  document.cookie = `${ACCESS_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

// ─── In-flight refresh tracker (prevents duplicate refresh calls) ─────────────

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }
    clearTokens();
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

// ─── authFetch — drop-in fetch replacement with auto-refresh ─────────────────

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type for FormData (multipart)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(url, { ...options, headers });

  // If access token expired, try refreshing once
  if (res.status === 401) {
    let responseBody: any = null;
    try {
      const cloned = res.clone();
      responseBody = await cloned.json();
    } catch { /* non-JSON response */ }

    const code = responseBody?.code;

    if (code === 'TOKEN_EXPIRED' || code === 'NO_TOKEN') {
      // Deduplicate: only one refresh in-flight at a time
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        // Retry with new access token
        return fetch(url, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` }
        });
      } else {
        // Refresh failed → redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/seller/login';
        }
      }
    }
  }

  return res;
}

/** Convenience: authFetch + parse JSON */
export async function authFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await authFetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON but got ${contentType}. Status: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
