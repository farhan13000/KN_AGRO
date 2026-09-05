export const ALL_PERMISSIONS = "*";

export const PERMISSIONS = Object.freeze({
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  EMPLOYEES_READ: "employees.read",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_UPDATE: "employees.update",
  EMPLOYEES_PROMOTE: "employees.promote",
  EMPLOYEES_PROMOTE_REQUEST: "employees.promote_request",
  EMPLOYEES_DEACTIVATE: "employees.deactivate",
  EMPLOYEES_ASSIGN_MANAGER: "employees.assign_manager",
  EMPLOYEES_APPROVE: "employees.approve",
  EMPLOYEES_READ_SELF: "employees.read_self",
  EMPLOYEES_UPDATE_SELF: "employees.update_self",
  MANAGERS_READ: "managers.read",
  MANAGERS_MANAGE: "managers.manage",
  LEADS_READ: "leads.read",
  LEADS_CREATE: "leads.create",
  LEADS_UPDATE: "leads.update",
  LEADS_ASSIGN: "leads.assign",
  LEADS_CHANGE_STATUS: "leads.change_status",
  LEADS_FOLLOW_UP: "leads.follow_up",
  LEADS_ACTIVITIES_READ: "leads.activities.read",
  LEADS_ACTIVITIES_CREATE: "leads.activities.create",
  LEADS_MANAGE: "leads.manage",
  LEADS_ANALYTICS_READ: "leads.analytics.read",
  CATEGORIES_READ: "categories.read",
  CATEGORIES_MANAGE: "categories.manage",
  PRODUCTS_READ: "products.read",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_MANAGE: "products.manage",
  // Product Recommendations (backend Phase 13, verified). Deferred by
  // Phase F01 until this phase actually built the UI. GET / (the "visible
  // to me" list) is gated PRODUCTS_READ, not this — every role that can
  // see the catalog can see recommendations too; only manager-tier roles
  // additionally hold PRODUCTS_RECOMMEND to create/archive one. Approve
  // reuses the existing, broader PRODUCTS_MANAGE — no new constant for it.
  PRODUCTS_RECOMMEND: "products.recommend",
  INVENTORY_READ: "inventory.read",
  INVENTORY_STOCK_IN: "inventory.stock_in",
  INVENTORY_STOCK_OUT: "inventory.stock_out",
  INVENTORY_ADJUST: "inventory.adjust",
  INVENTORY_MANAGE: "inventory.manage",
  INVENTORY_TRANSACTIONS_READ: "inventory.transactions.read",
  ANALYTICS_READ: "analytics.read",
  // The central /analytics/* dashboard module's own TIER permissions
  // (Phase F12) — layered on top of, never replacing, each domain's own
  // *_ANALYTICS_READ above. ANALYTICS_ADMIN gates GET /analytics/admin/
  // dashboard (SA), ANALYTICS_MANAGER gates GET /analytics/manager/
  // dashboard (GM/RM/ASM, and SO — narrowed to GET /analytics/so/
  // dashboard in-service via the SAME ANALYTICS_EMPLOYEE permission SO
  // also holds), ANALYTICS_EMPLOYEE gates GET /analytics/employee/
  // dashboard (FO).
  ANALYTICS_ADMIN: "analytics.admin",
  ANALYTICS_MANAGER: "analytics.manager",
  ANALYTICS_EMPLOYEE: "analytics.employee",
  // Gates whether the Employee Dashboard's optional payroll section is
  // shown — the backend omits it entirely for a caller without this,
  // never returns a redacted version.
  PAYROLL_READ_SELF: "payroll.read_self",
  QUOTATIONS_READ: "quotations.read",
  QUOTATIONS_CREATE: "quotations.create",
  QUOTATIONS_UPDATE: "quotations.update",
  QUOTATIONS_SEND: "quotations.send",
  QUOTATIONS_ACCEPT: "quotations.accept",
  QUOTATIONS_REJECT: "quotations.reject",
  QUOTATIONS_MANAGE: "quotations.manage",
  CUSTOMERS_READ: "customers.read",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_UPDATE: "customers.update",
  ORDERS_READ: "orders.read",
  ORDERS_ANALYTICS_READ: "orders.analytics.read",
  ORDERS_CREATE: "orders.create",
  ORDERS_CONFIRM: "orders.confirm",
  // ORDERS_FULFILL gates all four fulfillment actions: Processing (Prompt
  // 30, Batch 3), Ready/Dispatch/Deliver (Prompts 31/32/34, this batch).
  ORDERS_FULFILL: "orders.fulfill",
  ORDERS_CANCEL: "orders.cancel",
  INVOICES_READ: "invoices.read",
  INVOICES_CREATE: "invoices.create",
  INVOICES_ISSUE: "invoices.issue",
  INVOICES_CANCEL: "invoices.cancel",
  PAYMENTS_READ: "payments.read",
  PAYMENTS_CREATE: "payments.create",

  // Org-hierarchy migration (SA/OA/GM/RM/ASM/SO/FO) — matches
  // BACKEND/backend/src/constants/permissions.js byte-for-byte. Only the
  // permissions this frontend's current migration phases actually need
  // are added here; HIRING_*/SALARY_PROPOSAL_*/DSR_* are deferred to the
  // phases that build their UI (F07/F08/F10) even though the backend
  // already seeds them ahead of those modules being built.
  REGION_READ: "region.read",
  REGION_CREATE: "region.create",
  REGION_UPDATE: "region.update",
  REGION_MANAGE: "region.manage",
  REGION_ASSIGN: "region.assign",

  DISTRICT_READ: "district.read",
  DISTRICT_CREATE: "district.create",
  DISTRICT_UPDATE: "district.update",
  DISTRICT_MANAGE: "district.manage",
  DISTRICT_ASSIGN: "district.assign",
  DISTRICT_TRANSFER: "district.transfer",

  EMPLOYEES_TRANSFER: "employees.transfer",

  // New tiered promotion workflow (backend Phase 7, verified) — distinct
  // from the existing EMPLOYEES_PROMOTE/EMPLOYEES_PROMOTE_REQUEST above,
  // which still serve today's legacy 3-role promotion-request flow.
  // EMPLOYEES_PROMOTE/EMPLOYEES_PROMOTE_REQUEST are used by
  // SuperAdminEmployeeDetailPage.jsx and features/employees/utils/
  // lifecycleActions.js — Phase F06 (Promotion Workflow UI) replaces
  // those call sites with these and removes the old two.
  PROMOTION_READ: "promotion.read",
  PROMOTION_RECOMMEND: "promotion.recommend",
  PROMOTION_APPROVE: "promotion.approve",
  PROMOTION_REJECT: "promotion.reject",

  // Hiring workflow (backend Phase 8, verified). HIRING_RECOMMEND gates
  // both the Process and Review steps; the actual OA-vs-GM narrowing
  // happens inside HiringService, not here.
  HIRING_READ: "hiring.read",
  HIRING_CREATE: "hiring.create",
  HIRING_RECOMMEND: "hiring.recommend",
  HIRING_APPROVE: "hiring.approve",
  HIRING_REJECT: "hiring.reject",

  // Existing (pre-migration) live SalaryStructure/Payroll permissions —
  // added here in Phase F08 since no frontend code referenced them before
  // this phase needed a read-only "current salary" display as a
  // prerequisite for the proposal-creation dialog (see CurrentSalaryCard).
  SALARY_READ_SELF: "salary.read_self",
  SALARY_READ: "salary.read",
  SALARY_MANAGE: "salary.manage",

  // Salary Proposal workflow (backend Phase 9, verified). /reject reuses
  // SALARY_PROPOSAL_RECOMMEND on the backend (no dedicated REJECT
  // permission exists) — GM genuinely holds it for their own
  // RECOMMENDED-stage rejection, and SA reaches every route via the
  // ALL_PERMISSIONS wildcard regardless; mirrored here rather than
  // inventing a REJECT constant the backend doesn't check.
  SALARY_PROPOSAL_READ: "salary_proposal.read",
  SALARY_PROPOSAL_CREATE: "salary_proposal.create",
  SALARY_PROPOSAL_RECOMMEND: "salary_proposal.recommend",
  SALARY_PROPOSAL_APPROVE: "salary_proposal.approve",
  SALARY_PROPOSAL_FINALIZE: "salary_proposal.finalize",

  // DSR (Daily Sales Report) workflow (backend Phase 12, verified). A
  // light two-step review chain (SUBMITTED -> REVIEWED -> ACKNOWLEDGED),
  // deliberately not a formal approve/reject — DSR_REVIEW gates BOTH the
  // review and acknowledge actions on the backend, same permission for
  // both stages (see dsr.routes.js).
  DSR_CREATE: "dsr.create",
  DSR_READ_SELF: "dsr.read_self",
  DSR_READ_TEAM: "dsr.read_team",
  DSR_READ_ALL: "dsr.read_all",
  DSR_REVIEW: "dsr.review",

  // Notifications (backend Phase 9, verified; Phase F13 built the first
  // frontend consumer). NOTIFICATIONS_READ gates all five routes
  // (list/unread-count/read/read-all/archive) — mutating your OWN
  // notification is self-service, same tier as viewing it.
  // NOTIFICATIONS_MANAGE exists on the backend but has no route yet
  // (manually creating one, or acting on someone else's) — not mirrored
  // here since there is nothing for it to gate on the frontend.
  NOTIFICATIONS_READ: "notifications.read",

  // Audit log (backend Phase 9, extended Phase 16; Phase F14 built the
  // first frontend consumer). Gates BOTH /audit routes (list + single
  // entry). Verified against seedRoles.js — held ONLY via the SA/legacy
  // SUPER_ADMIN ALL_PERMISSIONS wildcard; not even OA holds it directly,
  // despite OA otherwise sharing the Super Admin portal. AUDIT_EXPORT
  // exists on the backend's permission list but has no route to gate —
  // not mirrored here.
  AUDIT_READ: "audit.read",

  // Attendance (backend Phase 12, verified; Phase F17 built the first
  // frontend consumer). CHECK_IN/CHECK_OUT/READ_SELF held by every
  // seeded role with an Employee record; READ_TEAM by legacy
  // SALES_MANAGER/GM/RM/ASM/SO (not FO); CORRECT/READ_ALL held by
  // nobody directly — SA wildcard only.
  ATTENDANCE_CHECK_IN: "attendance.check_in",
  ATTENDANCE_CHECK_OUT: "attendance.check_out",
  ATTENDANCE_READ_SELF: "attendance.read_self",
  ATTENDANCE_READ_TEAM: "attendance.read_team",
  ATTENDANCE_CORRECT: "attendance.correct",
  ATTENDANCE_READ_ALL: "attendance.read_all",

  // Leaves (backend Phase 12, verified; Phase F17 built the first
  // frontend consumer). CREATE/READ_SELF/CANCEL_SELF held by every
  // seeded role with an Employee record; READ_TEAM/APPROVE by legacy
  // SALES_MANAGER/GM/RM/ASM/SO (not FO); READ_ALL held by nobody
  // directly — SA wildcard only.
  LEAVES_CREATE: "leaves.create",
  LEAVES_READ_SELF: "leaves.read_self",
  LEAVES_CANCEL_SELF: "leaves.cancel_self",
  LEAVES_READ_TEAM: "leaves.read_team",
  LEAVES_APPROVE: "leaves.approve",
  LEAVES_READ_ALL: "leaves.read_all",

  // Report Requests — ask-then-answer, distinct from DSR (backend Phase
  // 12, verified; Phase F18 built the first frontend consumer).
  // READ_SELF/SUBMIT held by every seeded role with an Employee record;
  // READ_TEAM/REQUEST/REVIEW by legacy SALES_MANAGER/GM/RM/ASM only —
  // narrower than Attendance/Leave's team tier, SO does NOT hold these.
  // MANAGE held by nobody directly — SA wildcard only.
  REPORTS_READ_SELF: "reports.read_self",
  REPORTS_SUBMIT: "reports.submit",
  REPORTS_READ_TEAM: "reports.read_team",
  REPORTS_REQUEST: "reports.request",
  REPORTS_REVIEW: "reports.review",
  REPORTS_MANAGE: "reports.manage",
});

