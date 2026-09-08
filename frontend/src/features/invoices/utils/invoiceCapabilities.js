import { PERMISSIONS } from "../../../shared/constants/permissions.constants.js";
import { INVOICE_STATUS } from "../constants/invoice.constants.js";

// Verified directly against invoice.service.js:
//   - issueInvoice: DRAFT -> ISSUED only (already-ISSUED is a 409, any
//     other status a 400).
//   - cancelInvoice: allowed from DRAFT or ISSUED (never from CANCELLED,
//     terminal). Blocked unconditionally — regardless of status or role —
//     the instant `paidAmount > 0` (a 409, checked before this).
//     An ISSUED invoice additionally requires INVOICES_MANAGE (403
//     otherwise), which the Super Admin and Office Admin hold: a sales
//     manager with `invoices.cancel` can void a DRAFT but never an ISSUED
//     one, even at zero payments. Mirrors the exact code order in
//     cancelInvoice, not a looser/stricter frontend guess.
//   - recordPayment (payment.service.js): only when status === ISSUED and
//     dueAmount > 0 — a DRAFT invoice or a fully-paid ISSUED invoice both
//     correctly show no Record Payment action.
export const getInvoiceCapabilities = ({ hasPermission, invoice }) => {
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
      // Cancelling an ISSUED invoice reverses money that has already been
      // billed, so it stays narrower than cancelling a draft — gated on
      // INVOICES_MANAGE rather than a role name, so the Office Admin
      // (who holds it) can act without SA being named here directly.
      (status === INVOICE_STATUS.DRAFT || hasPermission(PERMISSIONS.INVOICES_MANAGE)),
    canRecordPayment:
      hasPermission(PERMISSIONS.PAYMENTS_CREATE) && status === INVOICE_STATUS.ISSUED && dueAmount > 0,
  };
};
