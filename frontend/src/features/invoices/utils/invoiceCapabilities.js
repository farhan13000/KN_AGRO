import { BACKEND_ROLES } from "../../../shared/constants/roles.constants.js";
import { PERMISSIONS } from "../../../shared/constants/permissions.constants.js";
import { INVOICE_STATUS } from "../constants/invoice.constants.js";

// Verified directly against invoice.service.js:
//   - issueInvoice: DRAFT -> ISSUED only (already-ISSUED is a 409, any
//     other status a 400).
//   - cancelInvoice: allowed from DRAFT or ISSUED (never from CANCELLED,
//     terminal). Blocked unconditionally — regardless of status or role —
//     the instant `paidAmount > 0` (a 409, checked before the role check).
//     An ISSUED invoice additionally requires the acting user's role to be
//     `super_admin` (403 otherwise) — Sales Manager holds `invoices.cancel`
//     but can only ever use it on a DRAFT invoice, never an ISSUED one,
//     even at zero payments. This mirrors the exact code order in
//     cancelInvoice, not a looser/stricter frontend guess.
//   - recordPayment (payment.service.js): only when status === ISSUED and
//     dueAmount > 0 — a DRAFT invoice or a fully-paid ISSUED invoice both
//     correctly show no Record Payment action.
export const getInvoiceCapabilities = ({ hasPermission, invoice, role }) => {
  const status = invoice?.status;
  const paidAmount = invoice?.paymentSummary?.paidAmount ?? 0;
  const dueAmount = invoice?.paymentSummary?.dueAmount ?? 0;

  return {
    canListInvoice: hasPermission(PERMISSIONS.INVOICES_READ),
    canViewInvoice: hasPermission(PERMISSIONS.INVOICES_READ),
    canIssueInvoice: hasPermission(PERMISSIONS.INVOICES_ISSUE) && status === INVOICE_STATUS.DRAFT,
    canCancelInvoice:
      hasPermission(PERMISSIONS.INVOICES_CANCEL) &&
      [INVOICE_STATUS.DRAFT, INVOICE_STATUS.ISSUED].includes(status) &&
      paidAmount === 0 &&
      (status === INVOICE_STATUS.DRAFT || role === BACKEND_ROLES.SUPER_ADMIN),
    canRecordPayment:
      hasPermission(PERMISSIONS.PAYMENTS_CREATE) && status === INVOICE_STATUS.ISSUED && dueAmount > 0,
  };
};
