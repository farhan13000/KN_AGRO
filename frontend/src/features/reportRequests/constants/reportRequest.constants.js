export const REPORT_TYPE = Object.freeze({
  DSR: "DSR",
  GENERAL: "GENERAL",
  SALES_REPORT: "SALES_REPORT",
  FIELD_VISIT: "FIELD_VISIT",
  OTHER: "OTHER",
});

export const REPORT_TYPE_LABELS = Object.freeze({
  [REPORT_TYPE.DSR]: "DSR",
  [REPORT_TYPE.GENERAL]: "General",
  [REPORT_TYPE.SALES_REPORT]: "Sales Report",
  [REPORT_TYPE.FIELD_VISIT]: "Field Visit",
  [REPORT_TYPE.OTHER]: "Other",
});

// PENDING -> IN_PROGRESS -> SUBMITTED -> REVIEWED, or SUBMITTED ->
// REJECTED -> (resubmit) -> SUBMITTED again. CANCELLED is a real enum
// value on the backend but has no route to trigger it from this
// frontend (no cancel endpoint exists) — included here only so the
// status badge renders it correctly if it were ever set some other way,
// never something this UI can cause.
export const REPORT_STATUS = Object.freeze({
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
});

export const REPORT_STATUS_LABELS = Object.freeze({
  [REPORT_STATUS.PENDING]: "Pending",
  [REPORT_STATUS.IN_PROGRESS]: "In Progress",
  [REPORT_STATUS.SUBMITTED]: "Submitted",
  [REPORT_STATUS.REVIEWED]: "Reviewed",
  [REPORT_STATUS.REJECTED]: "Rejected",
  [REPORT_STATUS.CANCELLED]: "Cancelled",
});

export const REPORT_PRIORITY = Object.freeze({
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
});

export const REPORT_PRIORITY_LABELS = Object.freeze({
  [REPORT_PRIORITY.LOW]: "Low",
  [REPORT_PRIORITY.MEDIUM]: "Medium",
  [REPORT_PRIORITY.HIGH]: "High",
  [REPORT_PRIORITY.URGENT]: "Urgent",
});
