/**
 * "This account has no Employee record" is a legitimate state, not a
 * failure — several accounts (OA, and any admin/login-only account) sit
 * outside the sales hierarchy and genuinely have no employee profile, so
 * every self-service endpoint that keys off one answers 404 for them:
 * GET /employees/me, /payroll/me and /salary/me all throw the same
 * "No employee profile exists for this account".
 *
 * Screens use this to render a calm explanatory state instead of a red
 * error banner. Note the status lives on `error.status` — apiClient
 * normalizes every failure into a FrontendApiError, so there is no
 * `error.response` to read.
 */
export const isMissingEmployeeProfileError = (error) => error?.status === 404;
