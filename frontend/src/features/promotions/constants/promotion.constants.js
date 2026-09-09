// Mirrors BACKEND/backend/src/modules/promotions/promotion.constants.js.
export const PROMOTION_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  RECOMMENDED: "RECOMMENDED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
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
]);

export const PROMOTION_STATUS_LABELS = Object.freeze({
  [PROMOTION_STATUS.DRAFT]: "Draft",
  [PROMOTION_STATUS.RECOMMENDED]: "Awaiting Approval",
  [PROMOTION_STATUS.UNDER_REVIEW]: "Under Review",
  [PROMOTION_STATUS.APPROVED]: "Approved",
  [PROMOTION_STATUS.REJECTED]: "Rejected",
  [PROMOTION_STATUS.CANCELLED]: "Cancelled",
  [PROMOTION_STATUS.COMPLETED]: "Completed",
});
