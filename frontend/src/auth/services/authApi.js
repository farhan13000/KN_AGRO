import {
  API_ENDPOINTS,
  apiClient,
  clearAccessToken,
  setAccessToken,
  unwrapApiData,
} from "../../core/api";

const extractUser = (payload) => payload?.user ?? null;
const extractAccessToken = (payload) => payload?.accessToken ?? null;

const getMockAuthApi = async () => {
  if (!(import.meta.env.DEV && import.meta.env.VITE_USE_AUTH_MOCK === "true")) {
    return null;
  }

  const { mockAuthApi } = await import("../../mocks/auth.mock");
  return mockAuthApi;
};

export const authApi = {
  async login(credentials) {
    const mockAuthApi = await getMockAuthApi();
    if (mockAuthApi) return mockAuthApi.login(credentials);

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
    const mockAuthApi = await getMockAuthApi();
    if (mockAuthApi) return mockAuthApi.logout();

    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      return unwrapApiData(response);
    } finally {
      clearAccessToken();
    }
  },

  async refreshSession() {
    const mockAuthApi = await getMockAuthApi();
    if (mockAuthApi) return mockAuthApi.refreshSession();

    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
    const payload = unwrapApiData(response);
    const token = extractAccessToken(payload);

    if (token) {
      setAccessToken(token);
    }

    return {
      accessToken: token,
    };
  },

  async getCurrentUser() {
    const mockAuthApi = await getMockAuthApi();
    if (mockAuthApi) return mockAuthApi.getCurrentUser();

    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    const payload = unwrapApiData(response);

    return extractUser(payload);
  },

  async changePassword(payload) {
    const mockAuthApi = await getMockAuthApi();
    if (mockAuthApi) return mockAuthApi.changePassword(payload);

    const response = await apiClient.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
    clearAccessToken();
    return unwrapApiData(response);
  },
};
