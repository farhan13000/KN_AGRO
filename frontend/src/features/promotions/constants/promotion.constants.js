// Mirrors BACKEND/backend/src/modules/promotions/promotion.constants.js.
export const PROMOTION_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  RECOMMENDED: "RECOMMENDED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  // Approved, but the approver passed the manager decision up rather
  // than taking the employee themselves. The role change has NOT
  // happened yet — it lands together with the manager.
  PENDING_MANAGER_ASSIGNMENT: "PENDING_MANAGER_ASSIGNMENT",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
});

/**
 * What an approver must choose when approving — mirrors the backend's
 * PROMOTION_MANAGER_DECISION.
 */
export const PROMOTION_MANAGER_DECISION = Object.freeze({
  SELF: "SELF",
  ESCALATE: "ESCALATE",
});

/**
 * Statuses a promotion can still be acted on from — mirrors the backend's
 * own PROMOTION_NON_TERMINAL_STATUSES (promotion.constants.js). Used to
 * decide whether to offer Approve/Reject on a card.
 */
export const PROMOTION_NON_TERMINAL_STATUSES = Object.freeze([
  PROMOTION_STATUS.DRAFT,
  PROMOTION_STATUS.RECOMMENDED,
  PROMOTION_STATUS.UNDER_REVIEW,
  PROMOTION_STATUS.PENDING_MANAGER_ASSIGNMENT,
]);

export const PROMOTION_STATUS_LABELS = Object.freeze({
  [PROMOTION_STATUS.DRAFT]: "Draft",
  [PROMOTION_STATUS.RECOMMENDED]: "Awaiting Approval",
  [PROMOTION_STATUS.UNDER_REVIEW]: "Under Review",
  [PROMOTION_STATUS.APPROVED]: "Approved",
  [PROMOTION_STATUS.PENDING_MANAGER_ASSIGNMENT]: "Awaiting Manager",
  [PROMOTION_STATUS.REJECTED]: "Rejected",
  [PROMOTION_STATUS.CANCELLED]: "Cancelled",
  [PROMOTION_STATUS.COMPLETED]: "Completed",
});
