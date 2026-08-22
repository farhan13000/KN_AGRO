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

const refreshAccessToken = async () => {
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
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldAttemptRefresh(error)) {
      const originalRequest = error.config;
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        notifySessionExpired();
        return Promise.reject(normalizeApiError(refreshError));
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export const unwrapApiData = (response) => response?.data?.data ?? response?.data ?? null;
