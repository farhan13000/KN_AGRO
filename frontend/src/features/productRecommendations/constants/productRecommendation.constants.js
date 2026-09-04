// Mirrors BACKEND/backend/src/modules/productRecommendations/productRecommendation.constants.js.
export const RECOMMENDATION_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  ARCHIVED: "ARCHIVED",
});

export const RECOMMENDATION_STATUS_LABELS = Object.freeze({
  [RECOMMENDATION_STATUS.DRAFT]: "Draft",
  [RECOMMENDATION_STATUS.APPROVED]: "Approved",
  [RECOMMENDATION_STATUS.ARCHIVED]: "Archived",
});
