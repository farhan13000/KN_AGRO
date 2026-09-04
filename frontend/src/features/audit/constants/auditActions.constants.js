// Mirrors backend/src/modules/audit/audit.constants.js's AUDIT_ACTION enum
// exactly (grepped from source, not guessed) — powers the action filter
// dropdown. No per-action icon/label metadata (unlike notifications'
// NOTIFICATION_TYPE_META) — this doc's own acceptance criteria only asks
// for a correctly-formatted diff, not a curated icon per action, and a
// plain title-cased render of the real enum value is honest and always
// in sync with the backend by construction (a hand-maintained label map
// for 65+ actions would just be another thing to drift).
export const AUDIT_ACTIONS = Object.freeze([
  "AUTH_LOGIN_SUCCESS",
  "AUTH_LOGIN_FAILED",
  "AUTH_LOGOUT",
  "PASSWORD_CHANGED",

  "EMPLOYEE_CREATED",
  "EMPLOYEE_APPROVED",
  "EMPLOYEE_REJECTED",
  "EMPLOYEE_PROMOTED",
  "EMPLOYEE_DEMOTED",
  "EMPLOYEE_DEACTIVATED",
  "EMPLOYEE_TRANSFERRED",
  "PROMOTION_RECOMMENDED",
  "PROMOTION_APPROVED",
  "PROMOTION_REJECTED",
  "PROMOTION_CANCELLED",

  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "PRODUCT_STATUS_CHANGED",

  "INVENTORY_STOCK_IN",
  "INVENTORY_STOCK_OUT",
  "INVENTORY_ADJUSTED",
  "INVENTORY_DAMAGED",

  "LEAD_ASSIGNED",
  "LEAD_REASSIGNED",
  "LEAD_STATUS_CHANGED",

  "QUOTATION_CREATED",
  "QUOTATION_UPDATED",
  "QUOTATION_SENT",
  "QUOTATION_ACCEPTED",
  "QUOTATION_REJECTED",
  "QUOTATION_CANCELLED",

  "ORDER_CREATED",
  "ORDER_CONFIRMED",
  "ORDER_CANCELLED",
  "ORDER_DISPATCHED",
  "ORDER_DELIVERED",

  "INVOICE_CREATED",
  "INVOICE_ISSUED",
  "INVOICE_CANCELLED",
  "PAYMENT_RECORDED",

  "ATTENDANCE_CORRECTED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",

  "SALARY_STRUCTURE_CHANGED",
  "PAYROLL_PROCESSED",
  "PAYROLL_PAID",

  "REPORT_REQUESTED",
  "REPORT_REVIEWED",

  "ROLE_CHANGED",
  "PERMISSIONS_CHANGED",

  "DISTRICT_ASSIGNMENT_REQUESTED",
  "DISTRICT_ASSIGNMENT_REVIEWED",
  "DISTRICT_ASSIGNMENT_REJECTED",
  "DISTRICT_ASSIGNMENT_FINALIZED",

  "HIRING_REQUESTED",
  "HIRING_PROCESSED",
  "HIRING_REVIEWED",
  "HIRING_APPROVED",
  "HIRING_REJECTED",
  "HIRING_COMPLETED",

  "SALARY_PROPOSAL_CREATED",
  "SALARY_PROPOSAL_REVIEWED",
  "SALARY_PROPOSAL_APPROVED",
  "SALARY_PROPOSAL_REJECTED",
  "SALARY_PROPOSAL_FINALIZED",

  "DSR_REVIEWED",
  "DSR_ACKNOWLEDGED",

  "PRODUCT_RECOMMENDATION_CREATED",
  "PRODUCT_RECOMMENDATION_APPROVED",
  "PRODUCT_RECOMMENDATION_ARCHIVED",

  "OTHER",
]);

export const titleCaseAuditValue = (value) =>
  String(value || "")
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
