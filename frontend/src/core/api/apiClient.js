import axios from "axios";
import { API_CONFIG, API_ENDPOINTS } from "./apiConfig";
import { normalizeApiError } from "./apiError";
import { notifySessionExpired } from "../auth/sessionEvents";

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * True only when the server looked at the session and refused it.
 *
 * Works on both a raw axios error (what refreshAccessToken rejects with)
 * and an already-normalized FrontendApiError (what apiClient calls reject
 * with), because callers see both. A network failure, a timeout, a 5xx or
 * a 429 all come back false: none of those mean the session is dead, and
 * treating them as if they did is what logged people out whenever the
 * connection or the server hiccuped.
 */
export const isSessionRejected = (error) => {
  const status = error?.response?.status ?? error?.status ?? 0;
  return status === 401 || status === 403;
};

const shouldAttemptRefresh = (error) => {
  const status = error?.response?.status;
  const url = error?.config?.url || "";

  if (status !== 401 || error?.config?._retry) {
    return false;
  }

  return ![API_ENDPOINTS.AUTH.LOGIN, API_ENDPOINTS.AUTH.REFRESH].some(
    (authUrl) => url.includes(authUrl),
  );
};

/**
 * The ONE place a refresh request is made.
 *
 * The backend rotates the refresh token on every call — issuing the new
 * one immediately invalidates the old (see AuthService.refreshToken). So
 * two refreshes that both carry the pre-rotation cookie are fatal: the
 * second is answered 401 "Invalid refresh token", which the caller reads
 * as a dead session and logs the user out.
 *
 * That is exactly what a page reload used to do. AuthContext's mount
 * effect called authApi.refreshSession(), which posted to /auth/refresh
 * directly and so never saw this module-level guard — and React
 * StrictMode runs that effect twice in development. Everything that
 * refreshes now shares this single in-flight promise instead, so
 * concurrent callers get one request and one rotation between them.
 */
export const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post(API_ENDPOINTS.AUTH.REFRESH)
      .then((response) => {
        const token = response?.data?.data?.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // The instance sets Content-Type: application/json for every request,
  // which is right for all of them but file uploads. A multipart body
  // needs a boundary parameter in the header, and only the browser knows
  // it — so drop ours and let the browser write the whole header. Left
  // in place, multer sees no boundary and rejects the request.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldAttemptRefresh(error)) {
      const originalRequest = error.config;
      originalRequest._retry = true;

      let token;
      try {
        token = await refreshAccessToken();
      } catch (refreshError) {
        // Only the server saying "this session is not valid" ends the
        // session. A refresh that failed for any other reason — no
        // network, a timeout, a 500, a 429 — says nothing about the
        // session, and logging the user out for it threw away a perfectly
        // good login every time the connection flickered. That request
        // fails; the user stays signed in and the next one tries again.
        if (isSessionRejected(refreshError)) {
          clearAccessToken();
          notifySessionExpired();
        }
        return Promise.reject(normalizeApiError(refreshError));
      }

      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
      }
      return apiClient(originalRequest);
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export const unwrapApiData = (response) => response?.data?.data ?? response?.data ?? null;
