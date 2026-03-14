/**
 * User profile service: Fetches and caches Auth0 user profile data
 * Uses localStorage for client-side caching to minimize API calls
 */

import { ensureFreshAccessToken } from "@/utils/auth/authTokens";

/**
 * User profile shape from Auth0
 */
type UserProfile = {
  sub: string; // Auth0 user ID
  name?: string | null; // Full name
  given_name?: string | null; // First name
  family_name?: string | null; // Last name
  email?: string | null; // Email address
  picture?: string | null; // Avatar URL (Gravatar)
};

// LocalStorage key for cached profile
const PROFILE_KEY = "ambrosia_user_profile";

/**
 * Check if code is running in browser (not SSR)
 */
const isBrowser = () => typeof document !== "undefined";

/**
 * Safely parse cached profile JSON from localStorage
 */
const parseStoredProfile = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UserProfile;
  } catch {
    return null;
  }
};

/**
 * Retrieve cached user profile from localStorage
 * Returns null if not found or in SSR context
 */
export const getCachedUserProfile = () => {
  if (!isBrowser()) {
    return null;
  }

  return parseStoredProfile(localStorage.getItem(PROFILE_KEY));
};

/**
 * Store user profile in localStorage for subsequent page loads
 */
export const setCachedUserProfile = (profile: UserProfile) => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

/**
 * Clear cached profile from localStorage (called on logout)
 */
export const clearCachedUserProfile = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(PROFILE_KEY);
};

/**
 * Fetch user profile from backend API
 * Uses valid access token (refreshes if needed)
 * Caches result in localStorage for subsequent renders
 */
export const fetchUserProfile = async () => {
  // Ensure we have a valid access token
  const token = await ensureFreshAccessToken();
  if (!token) {
    return null;
  }

  // Call the user-profile proxy endpoint
  const response = await fetch("/api/auth/user-profile", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  // Parse and validate response
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.succeeded || !payload?.data?.sub) {
    return null;
  }

  // Cache result and return
  const profile = payload.data as UserProfile;
  setCachedUserProfile(profile);
  return profile;
};

// Export type for use in other modules
export type { UserProfile };
