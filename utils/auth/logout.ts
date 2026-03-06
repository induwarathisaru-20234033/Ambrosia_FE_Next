/**
 * Logout service: Clears auth state and redirects to Auth0 logout
 * Handles token cleanup, cache clearing, and redirect flow
 */

import {
  clearAuthTokens,
  ensureFreshAccessToken,
} from "@/utils/auth/authTokens";
import { clearCachedUserProfile } from "@/utils/auth/userProfile";

/**
 * Get the base URL of the application (protocol + host)
 * Used to construct the returnTo URL after Auth0 logout
 */
const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
};

/**
 * Perform logout: clear tokens, call backend logout, redirect to Auth0
 *
 * Flow:
 * 1. Get valid access token (refresh if needed)
 * 2. Call /Auth/logout endpoint with returnTo URL
 * 3. Clear all tokens and cached profile from browser
 * 4. Redirect to logout URL from backend (Auth0 session clear)
 * 5. After Auth0 logout, user redirected to /login
 *
 * @param onRedirect - Optional callback instead of immediate redirect
 *                     Useful for testing or custom redirect logic
 */
export const performLogout = async (
  onRedirect?: (logoutUrl: string) => void,
) => {
  // Construct the URL user returns to after Auth0 logout
  const baseUrl = getBaseUrl();
  const returnTo = `${baseUrl}/login`;

  // Get a fresh access token to send with logout request
  const token = await ensureFreshAccessToken();
  if (!token) {
    // No token available, just clear local state and return
    clearAuthTokens();
    clearCachedUserProfile();
    return null;
  }

  // Request logout URL from backend (which contacts Auth0)
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ returnTo }),
  });

  // Parse response
  const payload = await response.json().catch(() => null);

  // Clear all local state (do this even if backend call fails)
  clearAuthTokens();
  clearCachedUserProfile();

  // Validate we got a logout URL from backend
  if (!response.ok || !payload?.succeeded || !payload?.data?.logoutUrl) {
    return null;
  }

  // Redirect to Auth0 logout URL (which will redirect back to /login)
  const logoutUrl = payload.data.logoutUrl as string;
  if (onRedirect) {
    // Custom redirect callback
    onRedirect(logoutUrl);
  } else {
    // Standard redirect
    window.location.href = logoutUrl;
  }

  return logoutUrl;
};
