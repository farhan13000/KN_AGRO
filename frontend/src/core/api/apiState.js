export const API_ERROR_TYPES = Object.freeze({
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  NETWORK: "NETWORK",
  UNKNOWN: "UNKNOWN",
});

const defaultMessages = {
  [API_ERROR_TYPES.UNAUTHORIZED]: "Your session needs attention. Please sign in again.",
  [API_ERROR_TYPES.FORBIDDEN]: "You do not have permission to access this action.",
  [API_ERROR_TYPES.NOT_FOUND]: "The requested information could not be found.",
  [API_ERROR_TYPES.CONFLICT]: "This action conflicts with the current record state.",
  [API_ERROR_TYPES.RATE_LIMITED]: "Too many requests. Please wait a moment and try again.",
  [API_ERROR_TYPES.SERVER_ERROR]: "The server could not complete the request.",
  [API_ERROR_TYPES.SERVICE_UNAVAILABLE]: "The service is temporarily unavailable.",
  [API_ERROR_TYPES.NETWORK]: "Cannot reach the backend. Check that the backend is running and CORS origins match.",
  [API_ERROR_TYPES.UNKNOWN]: "Something went wrong. Please try again.",
};

export const getApiErrorType = (error) => {
  const status = error?.status || 0;

  if (!status) return API_ERROR_TYPES.NETWORK;
  if (status === 401) return API_ERROR_TYPES.UNAUTHORIZED;
  if (status === 403) return API_ERROR_TYPES.FORBIDDEN;
  if (status === 404) return API_ERROR_TYPES.NOT_FOUND;
  if (status === 409) return API_ERROR_TYPES.CONFLICT;
  if (status === 429) return API_ERROR_TYPES.RATE_LIMITED;
  if (status === 503) return API_ERROR_TYPES.SERVICE_UNAVAILABLE;
  if (status >= 500) return API_ERROR_TYPES.SERVER_ERROR;

  return API_ERROR_TYPES.UNKNOWN;
};

export const getApiErrorMessage = (error) => {
  const type = getApiErrorType(error);
  return error?.friendlyMessage || error?.message || defaultMessages[type];
};

export const getApiState = ({ data, error, isLoading }) => {
  if (isLoading) return "loading";
  if (error) return "error";
  if (Array.isArray(data) && data.length === 0) return "empty";
  if (data == null) return "empty";
  return "success";
};

