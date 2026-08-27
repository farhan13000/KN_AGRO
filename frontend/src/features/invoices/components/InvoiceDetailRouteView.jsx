import { useParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
// Narrow subpath import — only the one hook is needed here, not the whole
// Payments feature's components/services graph.
import { useInvoicePaymentHistory } from "../../payments/hooks";
import { useInvoiceDetail } from "../hooks";
import InvoiceDetailView from "./InvoiceDetailView";

export default function InvoiceDetailRouteView({
  backTo,
  customerDetailPathFor,
  orderDetailPathFor,
  printPathFor,
  roleLabel = "CRM",
}) {
  const { invoiceId } = useParams();
  const invoiceState = useInvoiceDetail(invoiceId);
  const invoice = invoiceState.data?.invoice;
  // Fetched in parallel, not gated behind invoiceState resolving first —
  // same "lazy, non-blocking secondary fetch" posture as
  // CustomerDetailRouteView's useCustomerHistory: Header/Customer/Items
  // render as soon as the primary invoice loads, Payment History has its
  // own independent loading state inside InvoicePaymentHistoryTable.
  const paymentHistoryState = useInvoicePaymentHistory(invoiceId);

  // Prompt 72 (Loading/Refetching states): gated on `!invoice`, not bare
  // `isLoading` — see OrderDetailRouteView's identical fix for the full
  // reasoning. Without it, Issue/Cancel/Record Payment's post-mutation
  // refetch would flash the whole page to a bare spinner even though the
  // still-valid previous data was already on screen.
  if (invoiceState.isLoading && !invoice) return <PageLoader message="Loading invoice..." />;
  if (invoiceState.isError) {
    return <ErrorState message={invoiceState.errorMessage} title="Unable to load invoice" />;
  }
  if (!invoice) {
    return (
      <EmptyState
        actionLabel="Back To Invoices"
        actionTo={backTo}
        description="The selected invoice could not be found or is outside your allowed scope."
        title="Invoice not found"
      />
    );
  }

  // Prompt 46: after recording a payment, refetch BOTH the Invoice (its
  // paidAmount/dueAmount/paymentStatus just changed) AND the Payment
  // History list (there's a new row). Issue/Cancel only ever change the
  // Invoice itself, so `onMutationSuccess` refetches just that.
  const handlePaymentRecorded = async () => {
    await Promise.all([invoiceState.refetch(), paymentHistoryState.refetch()]);
  };

  return (
    <InvoiceDetailView
      customerDetailPath={customerDetailPathFor && invoice.customer ? customerDetailPathFor(invoice.customer) : ""}
      invoice={invoice}
      onMutationSuccess={invoiceState.refetch}
      onPaymentRecorded={handlePaymentRecorded}
      orderDetailPath={orderDetailPathFor && invoice.order ? orderDetailPathFor(invoice.order) : ""}
      paymentHistoryState={paymentHistoryState}
      printPath={printPathFor ? printPathFor(invoice) : ""}
      roleLabel={roleLabel}
    />
  );
}
