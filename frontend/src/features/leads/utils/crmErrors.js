const CRM_STATUS_MESSAGES = Object.freeze({
  400: "Please check the highlighted CRM details and try again.",
  401: "Your session has expired. Sign in again to continue.",
  403: "This lead is no longer available for your role or permissions.",
  404: "This lead could not be found or is outside your allowed scope.",
  409: "This lead changed while you were working. The latest lead data has been reloaded.",
  429: "Too many requests. Please wait a moment before trying again.",
  500: "The backend could not complete this CRM action. Please try again.",
  503: "The CRM service is temporarily unavailable. Please try again shortly.",
});

const REFRESH_AFTER_STATUS = new Set([403, 404, 409]);

export const getCrmErrorMessage = (error, fallback = "Unable to complete this CRM action.") => {
  const statusMessage = CRM_STATUS_MESSAGES[error?.status];
  if (statusMessage) return statusMessage;
  return error?.friendlyMessage || error?.message || fallback;
};

export const shouldRefetchAfterCrmError = (error) => REFRESH_AFTER_STATUS.has(error?.status);
