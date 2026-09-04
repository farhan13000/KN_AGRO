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
  INVENTORY_READ: "inventory.read",
  INVENTORY_STOCK_IN: "inventory.stock_in",
  INVENTORY_STOCK_OUT: "inventory.stock_out",
  INVENTORY_ADJUST: "inventory.adjust",
  INVENTORY_MANAGE: "inventory.manage",
  INVENTORY_TRANSACTIONS_READ: "inventory.transactions.read",
  ANALYTICS_READ: "analytics.read",
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
});

