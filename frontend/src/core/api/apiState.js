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

/**
 * Almost every error the app shows — banners, form errors, whole-page
 * error states — is worded by getApiErrorMessage below, because
 * useAsyncResource/useAsyncMutation hand it every failure before any
 * screen sees one. So this file is where "what went wrong" stops being
 * HTTP vocabulary and starts being a sentence someone can act on.
 *
 * Two rules:
 *   1. Never show a status code, a header name, a token, a field path or
 *      anything else that only means something to whoever wrote the code.
 *   2. Say what to do next. "You do not have permission" leaves a person
 *      stuck; "…ask your manager or the Super Admin" does not.
 */
const defaultMessages = {
  [API_ERROR_TYPES.UNAUTHORIZED]: "Your session has ended.",
  [API_ERROR_TYPES.FORBIDDEN]: "You do not have permission for this action.",
  [API_ERROR_TYPES.NOT_FOUND]: "This could not be found.",
  [API_ERROR_TYPES.CONFLICT]: "Someone else changed this while you were working on it.",
  [API_ERROR_TYPES.RATE_LIMITED]: "Too many attempts in a row.",
  [API_ERROR_TYPES.SERVER_ERROR]: "Something went wrong at our end.",
  [API_ERROR_TYPES.SERVICE_UNAVAILABLE]: "The service is busy right now.",
  [API_ERROR_TYPES.NETWORK]: "Cannot reach the server.",
  [API_ERROR_TYPES.UNKNOWN]: "Something went wrong.",
};

/** The next step, for the cases where there is one worth naming. */
const hints = {
  [API_ERROR_TYPES.UNAUTHORIZED]: "Please sign in again to continue.",
  [API_ERROR_TYPES.FORBIDDEN]:
    "Ask your manager or the Super Admin to do it for you, or to give your role access.",
  [API_ERROR_TYPES.NOT_FOUND]:
    "It may have been removed, or it may be outside the area you cover. Go back and refresh the list.",
  [API_ERROR_TYPES.CONFLICT]: "Refresh the page to see the latest, then try again.",
  [API_ERROR_TYPES.RATE_LIMITED]: "Please wait a minute and try again.",
  [API_ERROR_TYPES.SERVER_ERROR]: "Please try again, and tell the Super Admin if it keeps happening.",
  [API_ERROR_TYPES.SERVICE_UNAVAILABLE]: "Please try again in a few moments.",
  [API_ERROR_TYPES.NETWORK]: "Check your internet connection and try again.",
  [API_ERROR_TYPES.UNKNOWN]: "Please try again.",
};

/**
 * Wording that belongs in a log, not on a screen. When a message matches
 * any of these it is dropped in favour of the plain-language default for
 * its type — a person cannot act on "Forbidden: Insufficient
 * permissions", "Cast to ObjectId failed" or "Request failed with status
 * code 500", and the last of those is our internals on their screen.
 *
 * The backend's own messages are otherwise trusted and preferred: they
 * are written for the person filling the form ("Reason is required",
 * "This lead is being handled by saurabh (GM)"), and they know the
 * specifics this file never can.
 */
const TECHNICAL = [
  /\b(forbidden|unauthorized)\b/i,
  /\b(access|refresh|bearer)?\s?token\b/i,
  /\bjwt\b/i,
  /\bmalformed\b/i,
  /\binvalid signature\b/i,
  /\bobjectid\b/i,
  /\bcast to\b/i,
  /\be11000\b/i,
  /\bstatus code\s*\d{3}\b/i,
  /\brequest failed\b/i,
  /\binternal server error\b/i,
  /cannot read propert/i,
  /\bis not a function\b/i,
  /\bis not defined\b/i,
  /\b(ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ERR_[A-Z_]+)\b/,
  /\bCORS\b/,
  /\b(localhost|127\.0\.0\.1)\b/i,
  /^\s*\w*Error:/,
];

const isTechnical = (message) => TECHNICAL.some((pattern) => pattern.test(message));

// A message that already tells the person what to do should not have a
// second instruction bolted onto it.
const alreadyAdvises = (message) =>
  /\b(ask|contact|try again|sign in again|refresh the page|please wait|go back)\b/i.test(message);

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

/**
 * What went wrong and what to do about it, as one sentence pair.
 *
 * A 400 is left to speak entirely for itself: it is the backend telling
 * someone which box on the form is wrong, and there is no generic advice
 * worth adding to that.
 */
export const describeApiError = (error) => {
  const type = getApiErrorType(error);
  const raw = String(error?.friendlyMessage || error?.message || "").trim();
  const usable = raw && !isTechnical(raw);
  const message = usable ? raw : defaultMessages[type];
  const isFieldProblem = getApiErrorType(error) === API_ERROR_TYPES.UNKNOWN && usable;
  const hint = isFieldProblem || alreadyAdvises(message) ? "" : hints[type] || "";

  // `isGeneric` says the server told us nothing usable, so a caller that
  // knows what it was acting on (a lead, an order) may say something
  // more precise than the catch-all above — see crmErrors.js.
  return { type, message, hint, isGeneric: !usable };
};

export const getApiErrorMessage = (error) => {
  const { message, hint } = describeApiError(error);
  return hint ? `${message} ${hint}` : message;
};

export const getApiState = ({ data, error, isLoading }) => {
  if (isLoading) return "loading";
  if (error) return "error";
  if (Array.isArray(data) && data.length === 0) return "empty";
  if (data == null) return "empty";
  return "success";
};
