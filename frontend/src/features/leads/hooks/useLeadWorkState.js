import { useMemo } from "react";
// Narrow subpath imports, not the two feature barrels: this needs one
// hook and one constant from each, not the whole Quotations and Orders
// UI graphs pulled into the Leads bundle.
import { ORDER_STATUS } from "../../orders/constants";
import { useOrderList } from "../../orders/hooks";
import { QUOTATION_STATUS } from "../../quotations/constants";
import { useQuotationList } from "../../quotations/hooks";

/**
 * What already exists against a lead — the quotations and orders that
 * decide what the next step actually is.
 *
 * WHY THE LEAD PAGE NEEDS THIS. "What happens next" is not a property of
 * the lead record. A lead sitting at QUALIFIED with a quotation already
 * out with the customer needs nothing priced; a lead whose order nobody
 * confirmed needs that before anything else, whatever its own stage
 * says. Both facts live on other documents, so the page fetches them
 * rather than guessing from `lead.status` alone — which is exactly how
 * the old panel ended up offering a bill on a lead nobody had called.
 *
 * Two extra requests per lead page, both small and both cached by the
 * query layer, in exchange for every action on the page being one that
 * can genuinely be taken.
 */
const LIST_QUERY = Object.freeze({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" });

// A quotation the customer still has to answer. DRAFT and
// PENDING_APPROVAL are deliberately NOT here: those are still inside the
// company, and the lead page should keep offering to get on with them.
const OPEN_QUOTATION_STATUSES = [QUOTATION_STATUS.SENT];

// Made, but holding no stock until someone confirms it. (The frontend
// enum has no DRAFT — an order only ever reaches a screen from PENDING.)
const UNCONFIRMED_ORDER_STATUSES = [ORDER_STATUS.PENDING];

// Past confirmation and not called off: an order that could carry a bill.
const SETTLED_OUT = [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED];

// Order.paymentStatus, written by PaymentService — "PAID" is the only
// value that means there is nothing left to collect.
const FULLY_PAID = "PAID";

export const useLeadWorkState = (leadId, { enabled = true } = {}) => {
  const quotationQuery = useMemo(() => ({ ...LIST_QUERY, lead: leadId }), [leadId]);
  const orderQuery = useMemo(() => ({ ...LIST_QUERY, lead: leadId }), [leadId]);

  const quotationsState = useQuotationList(quotationQuery, { enabled: enabled && Boolean(leadId) });
  const ordersState = useOrderList(orderQuery, { enabled: enabled && Boolean(leadId) });

  const quotations = quotationsState.data?.quotations || [];
  const orders = ordersState.data?.orders || [];

  return useMemo(() => {
    const openQuotation = quotations.find((q) => OPEN_QUOTATION_STATUSES.includes(q.status)) || null;
    const acceptedQuotation =
      quotations.find((q) => q.status === QUOTATION_STATUS.ACCEPTED) || null;
    const orderAwaitingConfirm =
      orders.find((o) => UNCONFIRMED_ORDER_STATUSES.includes(o.orderStatus)) || null;

    // An order past confirmation is one that could carry a bill. The
    // order list does not say whether a bill exists — the lead page does
    // not need to know, only whether asking for one could make sense.
    const billableOrder = orders.find((o) => !SETTLED_OUT.includes(o.orderStatus)) || null;

    const unpaidOrder =
      orders.find(
        (o) => o.paymentStatus && o.paymentStatus !== FULLY_PAID && !SETTLED_OUT.includes(o.orderStatus)
      ) || null;

    return {
      acceptedQuotation,
      billableOrder,
      isLoading: quotationsState.isLoading || ordersState.isLoading,
      openQuotation,
      orderAwaitingConfirm,
      orders,
      quotations,
      unpaidOrder,
    };
  }, [orders, ordersState.isLoading, quotations, quotationsState.isLoading]);
};
