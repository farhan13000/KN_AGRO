// Mirrors BACKEND/backend/src/modules/payroll/payroll.constants.js.
// Deliberately its own enum — never reuse Invoice's PAYMENT_STATUS: a
// payslip is processed then paid in full as one event, it has no
// partial-disbursement concept.
export const PAYROLL_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PROCESSED: "PROCESSED",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
});

export const PAYROLL_STATUS_LABELS = Object.freeze({
  [PAYROLL_STATUS.DRAFT]: "Draft",
  [PAYROLL_STATUS.PROCESSED]: "Processed",
  [PAYROLL_STATUS.PAID]: "Paid",
  [PAYROLL_STATUS.CANCELLED]: "Cancelled",
});

export const MONTH_LABELS = Object.freeze([
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]);

export const formatPeriod = (month, year) =>
  month >= 1 && month <= 12 ? `${MONTH_LABELS[month - 1]} ${year}` : `${month}/${year}`;
