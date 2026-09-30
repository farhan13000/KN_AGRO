/**
 * The module names as people read them, and the order they read best in:
 * the things someone is waiting on first, the routine reporting last.
 * Mirrors the backend's NOTIFICATION_MODULE keys exactly.
 */
export const PUSH_MODULE_LABELS = Object.freeze({
  approvals: "Approvals waiting on you",
  leads: "Leads",
  quotations: "Quotations",
  orders: "Orders",
  billing: "Invoices and payments",
  messages: "Chats",
  inventory: "Stock",
  employees: "Employees",
  leaves: "Leave requests",
  payroll: "Payroll",
  attendance: "Attendance",
  dsr: "Daily reports (DSR)",
  reports: "Report requests",
});

export const PUSH_MODULE_ORDER = Object.freeze([
  "approvals",
  "leads",
  "quotations",
  "orders",
  "billing",
  "messages",
  "inventory",
  "employees",
  "leaves",
  "payroll",
  "attendance",
  "dsr",
  "reports",
]);
