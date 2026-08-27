import { PERMISSIONS } from "../../../shared/constants/permissions.constants.js";
import { INVOICE_ELIGIBLE_ORDER_STATUSES, ORDER_STATUS } from "../constants/order.constants.js";

// The full transition matrix from PHASE6_FRONTEND_API_CONTRACT.md (no
// Super Admin bypass — every transition is a real permission + status
// check, never invented):
//   PENDING -> CONFIRMED, CANCELLED
//   CONFIRMED -> PROCESSING, CANCELLED
//   PROCESSING -> READY, CANCELLED
//   READY -> DISPATCHED, CANCELLED
//   DISPATCHED -> DELIVERED (no cancel from here)
//   DELIVERED / CANCELLED -> terminal
//
// As of Batch 4 every capability below has a real button behind it in
// OrderLifecycleActions.jsx (Confirm/Processing landed in Batch 3; Ready,
// Dispatch, Deliver, and Cancel land in this batch) — the matrix is fully
// wired end to end now, not just documented.
export const getOrderCapabilities = ({ hasPermission, order }) => {
  const status = order?.orderStatus;

  return {
    canListOrder: hasPermission(PERMISSIONS.ORDERS_READ),
    canViewOrder: hasPermission(PERMISSIONS.ORDERS_READ),
    canConfirmOrder: hasPermission(PERMISSIONS.ORDERS_CONFIRM) && status === ORDER_STATUS.PENDING,
    canMarkProcessing: hasPermission(PERMISSIONS.ORDERS_FULFILL) && status === ORDER_STATUS.CONFIRMED,
    canMarkReady: hasPermission(PERMISSIONS.ORDERS_FULFILL) && status === ORDER_STATUS.PROCESSING,
    canDispatchOrder: hasPermission(PERMISSIONS.ORDERS_FULFILL) && status === ORDER_STATUS.READY,
    canMarkDelivered: hasPermission(PERMISSIONS.ORDERS_FULFILL) && status === ORDER_STATUS.DISPATCHED,
    // Matches order.service.js#cancelOrder exactly: allowed from PENDING/
    // CONFIRMED/PROCESSING/READY only — DISPATCHED/DELIVERED/CANCELLED are
    // all terminal for cancellation (the transition matrix itself blocks
    // DISPATCHED+ with a 400).
    canCancelOrder:
      hasPermission(PERMISSIONS.ORDERS_CANCEL) &&
      [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.READY].includes(
        status,
      ),
    // Prompt 62 audit: this lived as an inline check inside
    // OrderInvoiceSection.jsx until Batch 7 — moved here so every
    // Order-domain capability (including this cross-domain one, gated on
    // the *Invoice* permission but keyed on *Order* eligibility) lives in
    // one place, matching how canCreateOrderFromQuotation lives in
    // quotationCapabilities.js rather than inline in a component.
    canGenerateInvoice:
      hasPermission(PERMISSIONS.INVOICES_CREATE) && INVOICE_ELIGIBLE_ORDER_STATUSES.includes(status),
  };
};
