import { API_ERROR_TYPES, describeApiError } from "../../../core/api";

/**
 * Lead-specific wording, for the cases where "this could not be found"
 * or "someone else changed this" can be said more precisely because we
 * know the thing being acted on is a lead. Everything else — the plain
 * language, the "what to do next" line, and keeping our internals off
 * the screen — comes from describeApiError, which words every other
 * error in the app too.
 *
 * These used to REPLACE the backend's message for every status, which
 * threw away the only sentence that said what was wrong. The backend
 * writes its errors for the person filling the form ("Reason is
 * required", "Cannot reopen a lead with status CONTACTED", "This lead is
 * being handled by saurabh (GM)"), so its message is preferred whenever
 * there is one.
 */
const LEAD_MESSAGES = Object.freeze({
  [API_ERROR_TYPES.NOT_FOUND]: "This lead could not be found, or it is outside the area you cover.",
  [API_ERROR_TYPES.CONFLICT]: "This lead changed while you were working on it.",
});

const REFRESH_AFTER_STATUS = new Set([403, 404, 409]);

export const getCrmErrorMessage = (error, fallback = "This could not be completed.") => {
  const { type, message, hint, isGeneric } = describeApiError(error);
  const base = (isGeneric && LEAD_MESSAGES[type]) || message || fallback;
  return hint ? `${base} ${hint}` : base;
};

/**
 * The remaining problems when a request failed on more than one field.
 * The message above is the first of them; these are the rest, so a form
 * with two bad fields does not hide one behind the other.
 */
export const getCrmErrorDetails = (error) => {
  const details = Array.isArray(error?.errors) ? error.errors.filter(Boolean) : [];
  return details.length > 1 ? details : [];
};

export const shouldRefetchAfterCrmError = (error) => REFRESH_AFTER_STATUS.has(error?.status);
