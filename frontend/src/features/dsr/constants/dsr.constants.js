// Mirrors BACKEND/backend/src/modules/dsr/dsr.constants.js. Deliberately
// no APPROVED/REJECTED — a light "seen it" review chain, not a formal
// multi-person approval.
export const DSR_STATUS = Object.freeze({
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  ACKNOWLEDGED: "ACKNOWLEDGED",
});

export const DSR_STATUS_LABELS = Object.freeze({
  [DSR_STATUS.SUBMITTED]: "Submitted",
  [DSR_STATUS.REVIEWED]: "Reviewed",
  [DSR_STATUS.ACKNOWLEDGED]: "Acknowledged",
});

/**
 * Mirrors the backend's DSR_REPORT_REASON. Why someone is NOT on the
 * "submitted" list — which is not the same vocabulary as DSR_STATUS,
 * because that describes a report that exists.
 */
export const DSR_REPORT_REASON = Object.freeze({
  NOT_SUBMITTED: "NOT_SUBMITTED",
  ON_LEAVE: "ON_LEAVE",
});

export const DSR_REPORT_REASON_LABELS = Object.freeze({
  [DSR_REPORT_REASON.NOT_SUBMITTED]: "Not submitted",
  [DSR_REPORT_REASON.ON_LEAVE]: "On leave",
});

/**
 * Amber is a gap to chase. Someone on approved leave owes nothing, so
 * they are blue — the same colour attendance uses for a leave day, and
 * deliberately not the same as the people a manager needs to ring.
 */
export const DSR_REPORT_REASON_STYLE = Object.freeze({
  [DSR_REPORT_REASON.NOT_SUBMITTED]: "bg-amber-100 text-amber-800 ring-amber-200",
  [DSR_REPORT_REASON.ON_LEAVE]: "bg-sky-100 text-sky-800 ring-sky-200",
});
