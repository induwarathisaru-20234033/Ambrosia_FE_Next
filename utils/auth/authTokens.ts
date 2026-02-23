/**
 * Configuration options for setting cookies
 */
type CookieOptions = {
  maxAge?: number; // Time in seconds until cookie expires
  path?: string; // Cookie path (default: "/")
  sameSite?: "Lax" | "Strict" | "None"; // CSRF protection (default: "Lax")
  secure?: boolean; // Only send over HTTPS (auto-detected)
};

/**
 * Token payload returned from login/refresh endpoints
 */
type AuthTokens = {
  access_token: string; // JWT access token for API requests
  refresh_token?: string; // Token used to get new access tokens
  id_token?: string; // User identity token from Auth0
  expires_at?: string | number; // Unix timestamp when access token expires
  expires_in?: number; // Seconds until access token expires
};

// Cookie names for storing tokens
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const ID_TOKEN_COOKIE = "id_token";
const EXPIRES_AT_COOKIE = "expires_at";

// Refresh token 60 seconds before expiration to avoid edge cases
const REFRESH_SAFETY_WINDOW_MS = 60 * 1000;

// Track ongoing refresh requests to prevent duplicate calls
let refreshPromise: Promise<string | null> | null = null;

/**
 * Check if code is running in browser (not SSR)
 */
const isBrowser = () => typeof document !== "undefined";

/**
 * Determine if cookies should be marked as Secure based on protocol
 */
const getSecureFlag = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.location.protocol === "https:";
};

/**
 * Set a cookie with proper encoding and security flags
 */
const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
) => {
  if (!isBrowser()) {
    return;
  }

  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? "/"}`);
  parts.push(`SameSite=${options.sameSite ?? "Lax"}`);

  const secure = options.secure ?? getSecureFlag();
  if (secure) {
    parts.push("Secure");
  }

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  document.cookie = parts.join("; ");
};

/**
 * Delete a cookie by setting its Max-Age to 0
 */
const deleteCookie = (name: string) => {
  setCookie(name, "", { maxAge: 0 });
};

/**
 * Read a cookie value by name
 */
export const getCookie = (name: string) => {
  if (!isBrowser()) {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
};

/**
 * Convert various timestamp formats to milliseconds since epoch
 * Handles: Unix timestamps (seconds or ms), numeric strings, and ISO strings
 */
const toEpochMs = (value?: string | number) => {
  if (value === undefined || value === null) {
    return null;
  }

  // If already a number, determine if seconds or milliseconds
  if (typeof value === "number") {
    return value > 1_000_000_000_000 ? value : value * 1000;
  }

  // Try parsing string as numeric timestamp
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
  }

  // Try parsing string as ISO date
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Calculate cookie Max-Age from token response
 * Uses expires_in (seconds) if available, otherwise calculates from expires_at
 */
const resolveAccessMaxAge = (tokens: AuthTokens) => {
  if (typeof tokens.expires_in === "number") {
    return tokens.expires_in;
  }

  const expiresAtMs = toEpochMs(tokens.expires_at);
  if (!expiresAtMs) {
    return undefined;
  }

  const deltaSeconds = Math.floor((expiresAtMs - Date.now()) / 1000);
  return deltaSeconds > 0 ? deltaSeconds : undefined;
};

/**
 * Store tokens in cookies after login/refresh
 * Sets appropriate Max-Age based on token expiration
 */
export const setAuthTokens = (tokens: AuthTokens) => {
  if (!tokens?.access_token) {
    return;
  }

  const accessMaxAge = resolveAccessMaxAge(tokens);

  // Store access token with expiration
  setCookie(ACCESS_TOKEN_COOKIE, tokens.access_token, { maxAge: accessMaxAge });

  // Refresh token doesn't have Max-Age (session cookie)
  if (tokens.refresh_token) {
    setCookie(REFRESH_TOKEN_COOKIE, tokens.refresh_token);
  }

  // Store ID token with same expiration as access token
  if (tokens.id_token) {
    setCookie(ID_TOKEN_COOKIE, tokens.id_token, { maxAge: accessMaxAge });
  }

  // Store expiration time for refresh logic
  if (tokens.expires_at) {
    setCookie(EXPIRES_AT_COOKIE, String(tokens.expires_at), {
      maxAge: accessMaxAge,
    });
  }
};

/**
 * Clear all auth tokens (called on logout)
 */
export const clearAuthTokens = () => {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
  deleteCookie(ID_TOKEN_COOKIE);
  deleteCookie(EXPIRES_AT_COOKIE);
};

// Getter functions for individual tokens
export const getAccessToken = () => getCookie(ACCESS_TOKEN_COOKIE);
export const getRefreshToken = () => getCookie(REFRESH_TOKEN_COOKIE);
export const getIdToken = () => getCookie(ID_TOKEN_COOKIE);
export const getExpiresAt = () => getCookie(EXPIRES_AT_COOKIE);

/**
 * Fetch new access token using refresh token
 * Called when access token is missing or expired
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch("/api/auth/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.succeeded || !payload?.data?.access_token) {
    return null;
  }

  // Cache new tokens
  setAuthTokens(payload.data);
  return payload.data.access_token as string;
};

/**
 * Get an access token, refreshing if needed
 * Handles three scenarios:
 * 1. No access token → refresh immediately
 * 2. Token not expiring soon → return current token
 * 3. Token expiring within safety window → refresh proactively
 *
 * Prevents duplicate refresh requests with refreshPromise tracking
 */
export const ensureFreshAccessToken = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    // No token at all, must refresh
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  }

  // Check if token is expiring soon
  const expiresAtMs = toEpochMs(getExpiresAt() || undefined);
  const shouldRefresh =
    expiresAtMs !== null &&
    Date.now() >= expiresAtMs - REFRESH_SAFETY_WINDOW_MS;

  if (!shouldRefresh) {
    // Token is good, return it
    return accessToken;
  }

  // Token expiring soon, refresh proactively
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;
  return refreshed ?? accessToken;
};

/**
 * Force a token refresh regardless of expiration time
 * Used when API returns 401 (unauthorized)
 * Prevents duplicate requests with refreshPromise tracking
 */
export const forceRefreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};
