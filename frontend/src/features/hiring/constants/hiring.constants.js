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
/**
 * The workflow is two steps: anyone with hiring.create raises a request,
 * and the Super Admin decides it — approving is also what creates the
 * account. The old Process (OA) and Review (GM) stages are gone.
 */
export const HIRING_STAGE_ROLES = Object.freeze({
  APPROVE: ["sa"],
});

// Mirrors the backend's STAGE_OWNER_ROLE: the Super Admin is the only
// decider, so the only rejecter. The two legacy statuses are here so a
// request left mid-flight by the old multi-stage workflow can still be
// rejected rather than being stuck forever.
export const HIRING_REJECT_STAGE_ROLES = Object.freeze({
  [HIRING_STATUS.REQUESTED]: "sa",
  [HIRING_STATUS.PROCESSING]: "sa",
  [HIRING_STATUS.UNDER_REVIEW]: "sa",
});
