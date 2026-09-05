import { getPortalRoutesForRole } from "../../../core/auth";

/**
 * One builder per `actionKey` the backend actually sets (grepped from
 * every `actionKey: "..."` call site across the backend's notification-
 * raising services — this is the complete, real set, not a guess at what
 * might exist). Each receives the current portal's ROUTES block and the
 * notification's `referenceId`, and returns a real route or null.
 *
 * Deliberately absent: VIEW_LEAVE_REQUEST, VIEW_REPORT_REQUEST,
 * VIEW_CONVERSATION. These actionKeys are real (the backend sets them),
 * but Frontend Phase F10 found that no Leave/ReportRequest/Messaging UI
 * exists anywhere in this frontend to link to. Per this codebase's own
 * rule (report a gap rather than fabricate a destination), these
 * notifications render with their icon/label/text but no click-through.
 *
 * VIEW_PAYROLL was in that list until Phase F19 built the payroll UI —
 * it now resolves, closing one of the gaps F10 flagged.
 */
const ACTION_ROUTE_BUILDERS = Object.freeze({
  VIEW_LEAD: (routes, id) => (routes.LEAD_DETAIL && id ? routes.LEAD_DETAIL.replace(":leadId", id) : null),
  VIEW_ORDER: (routes, id) => (routes.ORDER_DETAIL && id ? routes.ORDER_DETAIL.replace(":orderId", id) : null),
  VIEW_QUOTATION: (routes, id) =>
    routes.QUOTATION_DETAIL && id ? routes.QUOTATION_DETAIL.replace(":quotationId", id) : null,
  VIEW_INVOICE: (routes, id) => (routes.INVOICE_DETAIL && id ? routes.INVOICE_DETAIL.replace(":invoiceId", id) : null),
  // Payments have no per-record detail page in this frontend (list only)
  // — the list is still a real, useful destination.
  VIEW_PAYMENT: (routes) => routes.PAYMENTS || null,
  VIEW_INVENTORY: (routes, id) =>
    routes.INVENTORY_DETAIL && id ? routes.INVENTORY_DETAIL.replace(":productId", id) : null,
  VIEW_EMPLOYEE_APPLICATION: (routes, id) =>
    routes.EMPLOYEE_DETAIL && id ? routes.EMPLOYEE_DETAIL.replace(":employeeId", id) : null,
  // Phase F21 gave the Super Admin and Sales Manager portals their own
  // My Profile pages, so this now resolves in every portal — closing the
  // gap Phase F13 disclosed rather than guessed around.
  VIEW_MY_PROFILE: (routes) => routes.PROFILE || routes.MY_PROFILE || null,
  VIEW_DISTRICT: (routes, id) =>
    routes.DISTRICT_DETAIL && id ? routes.DISTRICT_DETAIL.replace(":districtId", id) : null,
  REVIEW_DISTRICT_ASSIGNMENT: (routes, id) =>
    routes.DISTRICT_DETAIL && id ? routes.DISTRICT_DETAIL.replace(":districtId", id) : null,
  // Promotion/Salary Proposal/Hiring have no per-record frontend detail
  // route (only a list/pipeline/approvals view) — link to that hub.
  VIEW_PROMOTION: (routes) => routes.PROMOTION_APPROVALS || null,
  REVIEW_PROMOTION: (routes) => routes.PROMOTION_APPROVALS || null,
  VIEW_SALARY_PROPOSAL: (routes) => routes.SALARY_PROPOSAL_APPROVALS || null,
  REVIEW_SALARY_PROPOSAL: (routes) => routes.SALARY_PROPOSAL_APPROVALS || null,
  VIEW_HIRING_REQUEST: (routes) => routes.HIRING || null,
  REVIEW_HIRING_REQUEST: (routes) => routes.HIRING || null,
  // A payroll notification is always about the recipient's OWN payslip,
  // so it goes to their My Payroll history (every portal has one) rather
  // than the admin-only company-wide run list.
  VIEW_PAYROLL: (routes) => routes.MY_PAYROLL || null,
});

/**
 * Resolves a notification's click-through destination for the CURRENTLY
 * logged-in actor's role — the same actionKey means a different URL
 * depending which portal is viewing it (e.g. VIEW_LEAD in the Super
 * Admin portal vs. the Employee portal). Returns null when there is
 * genuinely nowhere to send the user (no actionKey, unmapped actionKey,
 * or the current portal has no route for it) — callers render the
 * notification as plain, non-clickable text in that case.
 */
export const resolveNotificationRoute = (notification, roleName) => {
  if (!notification?.actionKey) return null;

  const portalRoutes = getPortalRoutesForRole(roleName);
  if (!portalRoutes) return null;

  const buildRoute = ACTION_ROUTE_BUILDERS[notification.actionKey];
  if (!buildRoute) return null;

  return buildRoute(portalRoutes, notification.referenceId) || null;
};
