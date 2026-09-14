import axios from "axios";
import { API_CONFIG } from "../../../../core/api/apiConfig";
import { normalizeApiError } from "../../../../core/api/apiError";
import { isSessionRejected } from "../../../../core/api/apiClient";

/**
 * The website customer's own HTTP client — deliberately a second axios
 * instance, not the shared `apiClient`.
 *
 * That one holds a module-level STAFF access token and refreshes against
 * /auth/refresh. A customer's session is a different identity with a
 * different refresh endpoint and a different cookie, and the two can be
 * signed in at the same time in one browser (an office admin looking at
 * what a buyer sees). Sharing the instance would mean whichever logged in
 * last wins, and a customer request would silently carry a staff token.
 *
 * Everything else mirrors the staff client on purpose: one in-flight
 * refresh shared by concurrent callers (the backend rotates the refresh
 * token, so two simultaneous refreshes kill the session), and one retry
 * of the original request after a successful refresh.
 */
let accessToken = null;
let refreshPromise = null;
let onSessionLost = null;

export const setCustomerAccessToken = (token) => {
  accessToken = token || null;
};

export const getCustomerAccessToken = () => accessToken;

export const clearCustomerAccessToken = () => {
  accessToken = null;
};

/** Lets the provider clear its own state when a refresh finally fails. */
export const setCustomerSessionLostHandler = (handler) => {
  onSessionLost = typeof handler === "function" ? handler : null;
};

const REFRESH_PATH = "/account/refresh";
const PUBLIC_PATHS = ["/account/login", "/account/register", REFRESH_PATH];

const clientConfig = {
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  // The refresh token rides in an httpOnly cookie, so credentials must
  // travel on every call.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
};

export const accountClient = axios.create(clientConfig);
const refreshClient = axios.create(clientConfig);

export const refreshCustomerSession = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post(REFRESH_PATH)
      .then((response) => {
        const token = response?.data?.data?.accessToken;
        setCustomerAccessToken(token);
        return { token, account: response?.data?.data?.account ?? null };
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

accountClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

accountClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthCall = PUBLIC_PATHS.some((path) => url.includes(path));

    if (status === 401 && !error?.config?._retry && !isAuthCall) {
      const originalRequest = error.config;
      originalRequest._retry = true;

      try {
        const { token } = await refreshCustomerSession();
        if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
        return accountClient(originalRequest);
      } catch (refreshError) {
        // Same rule as the staff client: only the server refusing the
        // session signs the customer out. A dropped connection or a 5xx
        // fails this one request and leaves them signed in.
        if (isSessionRejected(refreshError)) {
          clearCustomerAccessToken();
          onSessionLost?.();
        }
        return Promise.reject(normalizeApiError(refreshError));
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export const unwrapAccountData = (response) => response?.data?.data ?? response?.data ?? null;
