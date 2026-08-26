import { Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useQuotationPrintView } from "../hooks";
import QuotationPrintView from "./QuotationPrintView";

// Prompt 38 (PDF boundary): no PDF library is used here on purpose —
// window.print() lets every browser's own "Save as PDF" destination cover
// that need without adding a dependency. See
// docs_about_the_phase_completion/phase5_frontend_progress.md for the
// explicit decision record.
export default function QuotationPrintRouteView({ backTo }) {
  const { quotationId } = useParams();
  const printState = useQuotationPrintView(quotationId);
  const quotation = printState.data?.quotation;

  if (printState.isLoading) return <PageLoader message="Loading quotation..." />;
  if (printState.isError) {
    return <ErrorState message={printState.errorMessage} title="Unable to load quotation" />;
  }
  if (!quotation) {
    return (
      <EmptyState
        actionLabel="Back To Quotations"
        actionTo={backTo}
        description="The selected quotation could not be found or is outside your allowed scope."
        title="Quotation not found"
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
      <QuotationPrintView quotation={quotation} />
    </div>
  );
}
