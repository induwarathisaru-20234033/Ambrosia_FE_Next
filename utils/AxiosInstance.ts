/**
 * Axios instance with automatic token management
 * Handles:
 * - Adding access tokens to all API requests
 * - Refreshing expired tokens automatically
 * - Retrying failed requests after token refresh
 * - Clearing auth state on permanent failures
 */

import axios from "axios";
import {
  clearAuthTokens,
  ensureFreshAccessToken,
  forceRefreshAccessToken,
  getAccessToken,
} from "@/utils/authTokens";

/**
 * Create axios instance with backend API base URL
 */
const axiosAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR: Add access token to all outgoing requests
 *
 * - Ensures token is fresh (refreshes if needed or expiring soon)
 * - Adds Authorization header with Bearer token
 * - Allows requests without token if none available
 */
axiosAuth.interceptors.request.use(async (config) => {
  // Get a fresh token (refreshes if expired/expiring)
  const accessToken = await ensureFreshAccessToken();
  if (accessToken) {
    // Add token to Authorization header
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * RESPONSE INTERCEPTOR: Handle 401 errors and token refresh
 *
 * Scenarios:
 * 1. Successful response → pass through
 * 2. Non-401 error → reject (nothing to do)
 * 3. Already retried this request → reject (avoid infinite loop)
 * 4. 401 error, not retried yet → attempt token refresh and retry
 * 5. Refresh fails or token unchanged → clear auth and reject
 */
axiosAuth.interceptors.response.use(
  // Success case: just pass through
  (response) => response,
  // Error case: handle 401 and retry
  async (error) => {
    // Get original request config with retry tracking
    const originalRequest = error?.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    // Only handle 401 errors that haven't been retried yet
    if (error?.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // Mark request as retried to prevent infinite loops
    originalRequest._retry = true;

    // Try to refresh the token
    const refreshedToken = await forceRefreshAccessToken();

    // Check if refresh succeeded and returned a different token
    if (!refreshedToken || refreshedToken === getAccessToken()) {
      // Refresh failed or returned same token → permanent auth failure
      clearAuthTokens();
      return Promise.reject(error);
    }

    // Update request with new token
    originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;

    // Retry the original request with fresh token
    return axiosAuth(originalRequest);
  },
);

export default axiosAuth;
