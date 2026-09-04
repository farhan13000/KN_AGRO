import { Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useInvoicePrintView } from "../hooks";
import InvoicePrintView from "./InvoicePrintView";

// Prompt 56 (PDF boundary): same decision already made for Quotations in
// Phase 5 — window.print() lets every browser's own "Save as PDF"
// destination cover that need without adding a PDF dependency. No new
// decision to make here, just the same one applied consistently.
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
      <div className="mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()} variant="secondary">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
      <InvoicePrintView invoice={invoice} />
    </div>
  );
}
