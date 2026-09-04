import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
// Narrow subpath import — only the list hook is needed here, not the whole
// Invoices feature's components/forms graph.
import { useInvoiceList } from "../../invoices/hooks";
import { useOrderDetail } from "../hooks";
import OrderDetailView from "./OrderDetailView";

// Prompts 28/30/32/33/34/35 all require that a successful (or conflicted)
// lifecycle action refetches both the Order AND the relevant Inventory.
// The Order refetch is the normal `orderState.refetch()`. "Refetch
// Inventory" is implemented by bumping `inventoryRefreshToken` and passing
// it down as the Inventory Reservation Summary's own React `key` (applied
// in OrderDetailView, not here) — changing just that one subtree's `key`
// remounts only it, so every per-item `useInventoryDetail` call inside
// re-fires fresh without forcing the whole page (header, actions, item
// table) to flash/remount. This one mechanism covers every action wired in
// OrderLifecycleActions.jsx (Confirm/Processing/Ready/Dispatch/Deliver/
// Cancel), not just Confirm.
//
// Prompt 32 also asks to "refetch Inventory Transactions if visible" after
// Dispatch — this page has no Inventory Transactions section on it (that's
// a separate Phase 4 page), so there is nothing to refetch here; the
// "if visible" condition is genuinely not met, not an oversight.
export default function OrderDetailRouteView({
  backTo,
  customerDetailPathFor,
  invoiceDetailPathFor,
  printPathFor,
  quotationDetailPathFor,
  roleLabel = "CRM",
}) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const orderState = useOrderDetail(orderId);
  const order = orderState.data?.order;
  const [inventoryRefreshToken, setInventoryRefreshToken] = useState(0);
  // Prompt 41: the Order model has no back-reference to its own Invoice
  // (uniqueness lives only on Invoice.order) — this lightweight, parallel
  // lookup is the one extra read needed so OrderInvoiceSection can show
  // "View Invoice" instead of a Generate button that would just 409.
  const existingInvoiceState = useInvoiceList({ order: orderId, limit: 1 }, { enabled: Boolean(orderId) });

  // Prompt 72 (Loading/Refetching states): gated on `!order`, not bare
  // `isLoading` — `useAsyncResource` sets `isLoading` true on every
  // refetch, not only the first one. Without the `!order` guard, every
  // lifecycle action's post-mutation refetch would unmount this whole page
  // to a bare spinner for a moment, even though the previous (still valid,
  // about-to-be-refreshed) data was already on screen. This way only the
  // genuine initial load shows the full-page loader; a background refetch
  // just quietly re-renders with the fresh data once it arrives.
  if (orderState.isLoading && !order) return <PageLoader message="Loading order..." />;
  if (orderState.isError) {
    return <ErrorState message={orderState.errorMessage} title="Unable to load order" />;
  }
  if (!order) {
    return (
      <EmptyState
        actionLabel="Back To Orders"
        actionTo={backTo}
        description="The selected order could not be found or is outside your allowed scope."
        title="Order not found"
      />
    );
  }

  const handleMutationSuccess = async () => {
    await orderState.refetch();
    setInventoryRefreshToken((token) => token + 1);
  };

  // A newly generated Invoice is a different record than the one on
  // screen — same posture as Quotation's Create Order and Revise: navigate
  // to it rather than refetching this (unchanged) Order in place.
  const handleInvoiceCreated = (invoice) => {
    if (invoiceDetailPathFor && invoice) navigate(invoiceDetailPathFor(invoice));
  };

  return (
    <OrderDetailView
      customerDetailPath={customerDetailPathFor && order.customer ? customerDetailPathFor(order.customer) : ""}
      existingInvoiceState={existingInvoiceState}
      invoiceDetailPathFor={invoiceDetailPathFor}
      inventoryRefreshToken={inventoryRefreshToken}
      onInvoiceCreated={handleInvoiceCreated}
      onMutationSuccess={handleMutationSuccess}
      order={order}
      printPath={printPathFor ? printPathFor(order) : ""}
      quotationDetailPath={quotationDetailPathFor && order.quotation ? quotationDetailPathFor(order.quotation) : ""}
      roleLabel={roleLabel}
    />
  );
}
