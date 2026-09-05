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
