export const LEAVE_TYPE = Object.freeze({
  CASUAL: "CASUAL",
  SICK: "SICK",
  EARNED: "EARNED",
  UNPAID: "UNPAID",
  OTHER: "OTHER",
});

export const LEAVE_TYPE_LABELS = Object.freeze({
  [LEAVE_TYPE.CASUAL]: "Casual",
  [LEAVE_TYPE.SICK]: "Sick",
  [LEAVE_TYPE.EARNED]: "Earned",
  [LEAVE_TYPE.UNPAID]: "Unpaid",
  [LEAVE_TYPE.OTHER]: "Other",
});

export const LEAVE_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
});

export const LEAVE_STATUS_LABELS = Object.freeze({
  [LEAVE_STATUS.PENDING]: "Pending",
  [LEAVE_STATUS.APPROVED]: "Approved",
  [LEAVE_STATUS.REJECTED]: "Rejected",
  [LEAVE_STATUS.CANCELLED]: "Cancelled",
});

/**
 * Administrator override actions — mirrors the backend's
 * LEAVE_OVERRIDE_ACTION. AMEND changes the request's content rather
 * than its status, but is grouped here because it is the same kind of
 * exceptional act and carries the same mandatory reason.
 */
export const LEAVE_OVERRIDE_ACTION = Object.freeze({
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  CANCEL: "CANCEL",
  AMEND: "AMEND",
});

export const LEAVE_OVERRIDE_ACTION_LABELS = Object.freeze({
  [LEAVE_OVERRIDE_ACTION.APPROVE]: "Approve",
  [LEAVE_OVERRIDE_ACTION.REJECT]: "Reject",
  [LEAVE_OVERRIDE_ACTION.CANCEL]: "Cancel",
  [LEAVE_OVERRIDE_ACTION.AMEND]: "Amend dates or type",
});
