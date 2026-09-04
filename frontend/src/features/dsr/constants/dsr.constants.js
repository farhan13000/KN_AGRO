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
