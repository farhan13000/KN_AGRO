const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

export class FrontendApiError extends Error {
  constructor({ message, status, code, errors, originalError } = {}) {
    super(message || DEFAULT_ERROR_MESSAGE);
    this.name = "FrontendApiError";
    this.status = status || 0;
    this.code = code || "";
    this.errors = Array.isArray(errors) ? errors : [];
    this.originalError = originalError;
    this.friendlyMessage = this.message;
  }
}

export const normalizeApiError = (error) => {
  const response = error?.response;
  const payload = response?.data || {};
  const isNetworkError = !response && error?.message === "Network Error";
  const isTimeoutError = error?.code === "ECONNABORTED" || error?.message?.includes("timeout");

  return new FrontendApiError({
    message:
      payload.message ||
      (isTimeoutError
        ? "The backend took too long to respond. Make sure the backend is running, MongoDB is connected, and then refresh the page."
        : "") ||
      (isNetworkError
        ? "Cannot reach the backend. Make sure the backend is running and the frontend URL matches the backend CORS CLIENT_URL."
        : error?.message) ||
      DEFAULT_ERROR_MESSAGE,
    status: response?.status || payload.statusCode || 0,
    code: payload.code || "",
    errors: Array.isArray(payload.errors) ? payload.errors : [],
    originalError: error,
  });
};
