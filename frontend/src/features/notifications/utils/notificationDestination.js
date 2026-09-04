import { getPortalRoutesForRole } from "../../../core/auth";

/**
 * One builder per `actionKey` the backend actually sets (grepped from
 * every `actionKey: "..."` call site across the backend's notification-
 * raising services — this is the complete, real set, not a guess at what
 * might exist). Each receives the current portal's ROUTES block and the
 * notification's `referenceId`, and returns a real route or null.
 *
 * Deliberately absent: VIEW_LEAVE_REQUEST, VIEW_REPORT_REQUEST,
 * VIEW_PAYROLL, VIEW_CONVERSATION. These actionKeys are real (the backend
 * sets them), but Frontend Phase F10 already found — and this phase
 * confirms again — that no Leave/ReportRequest/Payroll/Messaging UI
 * exists anywhere in this frontend to link to. Per this codebase's own
 * rule (report a gap rather than fabricate a destination), these
 * notifications render with their icon/label/text but no click-through;
 * see this phase's own "Stop and report" writeup.
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
  // Only the Employee portal has a genuine "my own profile" page — SA/
  // manager-tier portals have no equivalent, so this resolves to null
  // for them rather than guessing at an unconfirmed self-view route.
  VIEW_MY_PROFILE: (routes) => routes.PROFILE || null,
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
