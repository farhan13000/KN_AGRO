import { env } from "../config";

export const API_CONFIG = Object.freeze({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
});

export const API_ENDPOINTS = Object.freeze({
  HEALTH: "/health",
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  EMPLOYEES: {
    BASE: "/employees",
    REGISTER: "/employees/register",
    ME: "/employees/me",
    MY_TEAM: "/employees/my-team",
    PENDING: "/employees/pending",
    HIERARCHY: "/employees/hierarchy",
    SUMMARY: "/employees/summary",
    DETAIL: (employeeId) => `/employees/${employeeId}`,
    MANAGER: (employeeId) => `/employees/${employeeId}/manager`,
    REPORTS: (employeeId) => `/employees/${employeeId}/reports`,
    DEACTIVATE: (employeeId) => `/employees/${employeeId}/deactivate`,
    RESIGN: (employeeId) => `/employees/${employeeId}/resign`,
    TERMINATE: (employeeId) => `/employees/${employeeId}/terminate`,
    REACTIVATE: (employeeId) => `/employees/${employeeId}/reactivate`,
    APPROVE: (employeeId) => `/employees/${employeeId}/approve`,
    REJECT: (employeeId) => `/employees/${employeeId}/reject`,
    PROMOTE: (employeeId) => `/employees/${employeeId}/promote`,
    PROMOTION_REQUEST: (employeeId) => `/employees/${employeeId}/promotion-request`,
    TRANSFER: (employeeId) => `/employees/${employeeId}/transfer`,
    TRANSFERS: (employeeId) => `/employees/${employeeId}/transfers`,
  },
  EMPLOYEE_ACTION_REQUESTS: {
    BASE: "/employee-action-requests",
    APPROVE: (requestId) => `/employee-action-requests/${requestId}/approve`,
    REJECT: (requestId) => `/employee-action-requests/${requestId}/reject`,
  },
  CATEGORIES: {
    BASE: "/categories",
    DETAIL: (categoryId) => `/categories/${categoryId}`,
    STATUS: (categoryId) => `/categories/${categoryId}/status`,
  },
  PRODUCTS: {
    BASE: "/products",
    SUMMARY: "/products/summary",
    DETAIL: (productId) => `/products/${productId}`,
    STATUS: (productId) => `/products/${productId}/status`,
  },
  INVENTORY: {
    BASE: "/inventory",
    TRANSACTIONS: "/inventory/transactions",
    LOW_STOCK: "/inventory/low-stock",
    OUT_OF_STOCK: "/inventory/out-of-stock",
    SUMMARY: "/inventory/summary",
    MOVEMENTS_REPORT: "/inventory/reports/movements",
    VALUATION_REPORT: "/inventory/reports/valuation",
    DETAIL: (productId) => `/inventory/${productId}`,
    PRODUCT_TRANSACTIONS: (productId) => `/inventory/${productId}/transactions`,
    STOCK_IN: (productId) => `/inventory/${productId}/stock-in`,
    STOCK_OUT: (productId) => `/inventory/${productId}/stock-out`,
    ADJUST: (productId) => `/inventory/${productId}/adjust`,
    DAMAGED: (productId) => `/inventory/${productId}/damaged`,
    OPENING_STOCK: (productId) => `/inventory/${productId}/opening-stock`,
  },
  LEADS: {
    BASE: "/leads",
    SUMMARY: "/leads/summary",
    UNASSIGNED: "/leads/unassigned",
    FOLLOW_UPS_TODAY: "/leads/follow-ups/today",
    FOLLOW_UPS_OVERDUE: "/leads/follow-ups/overdue",
    FOLLOW_UPS_UPCOMING: "/leads/follow-ups/upcoming",
    ANALYTICS_FUNNEL: "/leads/analytics/funnel",
    ANALYTICS_SOURCES: "/leads/analytics/sources",
    ANALYTICS_PRODUCTS: "/leads/analytics/products",
    ANALYTICS_EMPLOYEES: "/leads/analytics/employees",
    DETAIL: (leadId) => `/leads/${leadId}`,
    MANAGER: (leadId) => `/leads/${leadId}/manager`,
    EMPLOYEE: (leadId) => `/leads/${leadId}/employee`,
    STATUS: (leadId) => `/leads/${leadId}/status`,
    REOPEN: (leadId) => `/leads/${leadId}/reopen`,
    PRIORITY: (leadId) => `/leads/${leadId}/priority`,
    ACTIVITIES: (leadId) => `/leads/${leadId}/activities`,
    FOLLOW_UPS: (leadId) => `/leads/${leadId}/follow-ups`,
    COMPLETE_FOLLOW_UP: (leadId) => `/leads/${leadId}/follow-ups/complete`,
    QUOTATIONS: (leadId) => `/leads/${leadId}/quotations`,
  },
  QUOTATIONS: {
    BASE: "/quotations",
    DETAIL: (quotationId) => `/quotations/${quotationId}`,
    PRINT: (quotationId) => `/quotations/${quotationId}/print`,
    SEND: (quotationId) => `/quotations/${quotationId}/send`,
    ACCEPT: (quotationId) => `/quotations/${quotationId}/accept`,
    REJECT: (quotationId) => `/quotations/${quotationId}/reject`,
    CANCEL: (quotationId) => `/quotations/${quotationId}/cancel`,
    REVISE: (quotationId) => `/quotations/${quotationId}/revise`,
  },
  ROLES: {
    BASE: "/roles",
  },
  // Mounted at /hiring-requests in the backend's routes/index.js — the
  // module is named `hiring`, the path is not.
  // Uploads for the only two files this system stores: employee profile
  // photos and hiring resumes. `kind` is one of the backend's MEDIA_KIND
  // values and decides folder, allowed types, size cap and permission.
  MEDIA: {
    UPLOAD: (kind) => `/media/uploads/${kind}`,
  },

  HIRING: {
    BASE: "/hiring-requests",
    DETAIL: (requestId) => `/hiring-requests/${requestId}`,
    PROCESS: (requestId) => `/hiring-requests/${requestId}/process`,
    REVIEW: (requestId) => `/hiring-requests/${requestId}/review`,
    APPROVE: (requestId) => `/hiring-requests/${requestId}/approve`,
    REJECT: (requestId) => `/hiring-requests/${requestId}/reject`,
    COMPLETE: (requestId) => `/hiring-requests/${requestId}/complete`,
  },
  PAYROLL: {
    BASE: "/payroll",
    ME: "/payroll/me",
    GENERATE: "/payroll/generate",
    GENERATE_BULK: "/payroll/generate-bulk",
    DETAIL: (payrollId) => `/payroll/${payrollId}`,
    PROCESS: (payrollId) => `/payroll/${payrollId}/process`,
    MARK_PAID: (payrollId) => `/payroll/${payrollId}/mark-paid`,
  },
  PROMOTIONS: {
    BASE: "/promotions",
    DETAIL: (promotionId) => `/promotions/${promotionId}`,
    APPROVE: (promotionId) => `/promotions/${promotionId}/approve`,
    REJECT: (promotionId) => `/promotions/${promotionId}/reject`,
    CANCEL: (promotionId) => `/promotions/${promotionId}/cancel`,
  },
  // Existing (pre-migration) live SalaryStructure module. F08 wired only
  // the read-only "current structure" endpoint its CurrentSalaryCard
  // needed; F21 added the two self-service/history reads below. The
  // write endpoint (POST /salary/:employeeId, SALARY_MANAGE) is still
  // deliberately unwired — salary changes go through the proposal
  // workflow, not a direct edit form.
  SALARY: {
    // Self-service (SALARY_READ_SELF) vs. viewing someone else's
    // (SALARY_READ — OA + SA wildcard only, deliberately NOT widened to
    // manager tiers).
    ME: "/salary/me",
    CURRENT: (employeeId) => `/salary/${employeeId}/current`,
    HISTORY: (employeeId) => `/salary/${employeeId}/history`,
  },
  SALARY_PROPOSALS: {
    BASE: "/salary-proposals",
    DETAIL: (proposalId) => `/salary-proposals/${proposalId}`,
    REVIEW: (proposalId) => `/salary-proposals/${proposalId}/review`,
    APPROVE: (proposalId) => `/salary-proposals/${proposalId}/approve`,
    REJECT: (proposalId) => `/salary-proposals/${proposalId}/reject`,
    FINALIZE: (proposalId) => `/salary-proposals/${proposalId}/finalize`,
  },
  REGIONS: {
    BASE: "/regions",
    DETAIL: (regionId) => `/regions/${regionId}`,
  },
  DISTRICTS: {
    BASE: "/districts",
    DETAIL: (districtId) => `/districts/${districtId}`,
    ASSIGN: (districtId) => `/districts/${districtId}/assign`,
    REASSIGN: (districtId) => `/districts/${districtId}/reassign`,
    ASSIGN_REVIEW: (districtId) => `/districts/${districtId}/assign/review`,
    ASSIGN_FINALIZE: (districtId) => `/districts/${districtId}/assign/finalize`,
  },
  CUSTOMERS: {
    BASE: "/customers",
    DETAIL: (customerId) => `/customers/${customerId}`,
    HISTORY: (customerId) => `/customers/${customerId}/history`,
    STATUS: (customerId) => `/customers/${customerId}/status`,
  },
  ORDERS: {
    BASE: "/orders",
    FROM_QUOTATION: (quotationId) => `/orders/from-quotation/${quotationId}`,
    // Fixed-segment route, must resolve before /:orderId server-side —
    // mirrored here only for the request path, no ordering concern on
    // the frontend since these are separate config entries, not routes.
    ATTRIBUTION: "/orders/attribution",
    DETAIL: (orderId) => `/orders/${orderId}`,
    CONFIRM: (orderId) => `/orders/${orderId}/confirm`,
    PROCESS: (orderId) => `/orders/${orderId}/process`,
    READY: (orderId) => `/orders/${orderId}/ready`,
    DISPATCH: (orderId) => `/orders/${orderId}/dispatch`,
    DELIVER: (orderId) => `/orders/${orderId}/deliver`,
    CANCEL: (orderId) => `/orders/${orderId}/cancel`,
  },
  INVOICES: {
    BASE: "/invoices",
    SUMMARY: "/invoices/summary",
    FROM_ORDER: (orderId) => `/invoices/from-order/${orderId}`,
    DETAIL: (invoiceId) => `/invoices/${invoiceId}`,
    PRINT: (invoiceId) => `/invoices/${invoiceId}/print`,
    ISSUE: (invoiceId) => `/invoices/${invoiceId}/issue`,
    CANCEL: (invoiceId) => `/invoices/${invoiceId}/cancel`,
    PAYMENTS: (invoiceId) => `/invoices/${invoiceId}/payments`,
  },
  PAYMENTS: {
    BASE: "/payments",
  },
  PRODUCT_RECOMMENDATIONS: {
    BASE: "/product-recommendations",
    APPROVE: (recommendationId) => `/product-recommendations/${recommendationId}/approve`,
    ARCHIVE: (recommendationId) => `/product-recommendations/${recommendationId}/archive`,
  },
  DSR: {
    BASE: "/dsr",
    ME: "/dsr/me",
    TEAM: "/dsr/team",
    REVIEW: (dsrId) => `/dsr/${dsrId}/review`,
    ACKNOWLEDGE: (dsrId) => `/dsr/${dsrId}/acknowledge`,
  },
  // The central per-role-tier dashboard module (Phase F12) — pre-existing
  // (Phase 8) and already extended for the new hierarchy (Phase 14): GM/
  // RM/ASM all share MANAGER_DASHBOARD (identical shape, different scoped
  // numbers); SO gets its own lighter SO_DASHBOARD; FO/legacy EMPLOYEE get
  // EMPLOYEE_DASHBOARD; SA/legacy SUPER_ADMIN get ADMIN_DASHBOARD.
  ANALYTICS: {
    ADMIN_DASHBOARD: "/analytics/admin/dashboard",
    MANAGER_DASHBOARD: "/analytics/manager/dashboard",
    EMPLOYEE_DASHBOARD: "/analytics/employee/dashboard",
    SO_DASHBOARD: "/analytics/so/dashboard",
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    READ_ALL: "/notifications/read-all",
    READ: (notificationId) => `/notifications/${notificationId}/read`,
    ARCHIVE: (notificationId) => `/notifications/${notificationId}/archive`,
  },
  AUDIT: {
    BASE: "/audit",
    DETAIL: (auditId) => `/audit/${auditId}`,
  },
  ATTENDANCE: {
    CHECK_IN: "/attendance/check-in",
    CHECK_OUT: "/attendance/check-out",
    ME_TODAY: "/attendance/me/today",
    ME_SUMMARY: "/attendance/me/summary",
    ME: "/attendance/me",
    TEAM_SUMMARY: "/attendance/team/summary",
    TEAM: "/attendance/team",
    CORRECT: (attendanceId) => `/attendance/${attendanceId}/correct`,
    BASE: "/attendance",
  },
  LEAVES: {
    BASE: "/leaves",
    ME: "/leaves/me",
    TEAM: "/leaves/team",
    APPROVE: (leaveId) => `/leaves/${leaveId}/approve`,
    REJECT: (leaveId) => `/leaves/${leaveId}/reject`,
    CANCEL: (leaveId) => `/leaves/${leaveId}/cancel`,
  },
  // Mounted at /reports in the backend's routes/index.js — the module is
  // named `reportRequests`, the path is not.
  REPORT_REQUESTS: {
    BASE: "/reports/requests",
    ME: "/reports/requests/me",
    TEAM: "/reports/requests/team",
    SUMMARY: "/reports/requests/summary",
    START: (reportRequestId) => `/reports/requests/${reportRequestId}/start`,
    SUBMIT: (reportRequestId) => `/reports/requests/${reportRequestId}/submit`,
    RESUBMIT: (reportRequestId) => `/reports/requests/${reportRequestId}/resubmit`,
    REVIEW: (reportRequestId) => `/reports/requests/${reportRequestId}/review`,
    REJECT: (reportRequestId) => `/reports/requests/${reportRequestId}/reject`,
  },
  PUBLIC: {
    CATEGORIES: "/public/categories",
    PRODUCTS: "/public/products",
    PRODUCT_DETAIL: (slug) => `/public/products/${slug}`,
    ENQUIRIES: "/public/enquiries",
  },
});
