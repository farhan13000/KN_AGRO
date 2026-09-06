import {
  API_ENDPOINTS,
  apiClient,
  clearAccessToken,
  refreshAccessToken,
  setAccessToken,
  unwrapApiData,
} from "../../core/api";

const extractUser = (payload) => payload?.user ?? null;
const extractAccessToken = (payload) => payload?.accessToken ?? null;

export const authApi = {
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    const payload = unwrapApiData(response);
    const token = extractAccessToken(payload);

    if (token) {
      setAccessToken(token);
    }

    return {
      user: extractUser(payload),
      accessToken: token,
    };
  },

  async logout() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      return unwrapApiData(response);
    } finally {
      clearAccessToken();
    }
  },

  /**
   * Deliberately goes through apiClient's shared refresh instead of
   * posting to /auth/refresh itself. The backend rotates the refresh
   * token on every call, so a second concurrent refresh carrying the
   * pre-rotation cookie is answered 401 and reads as a dead session —
   * see refreshAccessToken's own note. Sharing the in-flight promise is
   * what keeps a page reload from logging the user out.
   */
  async refreshSession() {
    const token = await refreshAccessToken();

    return {
      accessToken: token ?? null,
    };
  },

  async getCurrentUser() {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    const payload = unwrapApiData(response);

    return extractUser(payload);
  },

  async changePassword(payload) {
    const response = await apiClient.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
    clearAccessToken();
    return unwrapApiData(response);
  },
};
