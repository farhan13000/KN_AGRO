// Mirrors BACKEND/backend/src/modules/hiring/hiring.constants.js.
export const HIRING_STATUS = Object.freeze({
  REQUESTED: "REQUESTED",
  PROCESSING: "PROCESSING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
});

export const HIRING_STATUS_LABELS = Object.freeze({
  [HIRING_STATUS.REQUESTED]: "Requested",
  [HIRING_STATUS.PROCESSING]: "Processing",
  [HIRING_STATUS.UNDER_REVIEW]: "Under Review",
  [HIRING_STATUS.APPROVED]: "Approved",
  [HIRING_STATUS.REJECTED]: "Rejected",
  [HIRING_STATUS.COMPLETED]: "Completed",
});

/**
 * Which role owns each stage transition, mirroring HiringService's own
 * checks. Used ONLY to decide whether to render a button — the backend
 * remains the authority and its 403 is surfaced if the two disagree.
 */
export const HIRING_STAGE_ROLES = Object.freeze({
  PROCESS: ["oa"],
  REVIEW: ["gm"],
  APPROVE: ["sa"],
  COMPLETE: ["sa", "oa"],
});

// Reject is only possible while a stage owner exists for the current
// status (see the backend's STAGE_OWNER_ROLE map).
export const HIRING_REJECT_STAGE_ROLES = Object.freeze({
  [HIRING_STATUS.PROCESSING]: "oa",
  [HIRING_STATUS.UNDER_REVIEW]: "gm",
});
