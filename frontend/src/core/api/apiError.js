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
    // Written for whoever is holding the phone, not for whoever set the
    // server up: "MongoDB", "CORS CLIENT_URL" and "the backend" were
    // instructions no Field Officer can follow, on the two errors they
    // are most likely to hit out in the field.
    message:
      payload.message ||
      (isTimeoutError ? "The server is taking too long to respond. Please try again in a moment." : "") ||
      (isNetworkError
        ? "Cannot reach the server. Check your internet connection and try again."
        : error?.message) ||
      DEFAULT_ERROR_MESSAGE,
    status: response?.status || payload.statusCode || 0,
    code: payload.code || "",
    errors: Array.isArray(payload.errors) ? payload.errors : [],
    originalError: error,
  });
};
