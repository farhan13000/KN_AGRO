import { useParams } from "react-router-dom";
import DocumentPrintActions from "../../../shared/components/DocumentPrintActions";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useInvoicePrintView } from "../hooks";
import InvoicePrintView from "./InvoicePrintView";

// Print and Download both come from DocumentPrintActions, which every
// printable document shares. The old "window.print() is enough, no PDF
// dependency" decision recorded in
// docs_about_the_phase_completion/phase5_frontend_progress.md was
// reversed once these documents started being SENT rather than only
// printed — see shared/utils/documentPdf.js for why.
export default function InvoicePrintRouteView({ backTo }) {
  const { invoiceId } = useParams();
  const printState = useInvoicePrintView(invoiceId);
  const invoice = printState.data?.invoice;

  if (printState.isLoading) return <PageLoader message="Loading invoice..." />;
  if (printState.isError) {
    return <ErrorState message={printState.errorMessage} title="Unable to load invoice" />;
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

  return (
    <div>
      <DocumentPrintActions fileName={`Invoice ${invoice.invoiceNumber}`} />
      <InvoicePrintView invoice={invoice} />
    </div>
  );
}
