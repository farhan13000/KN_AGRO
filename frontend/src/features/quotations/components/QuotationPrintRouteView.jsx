import { useParams } from "react-router-dom";
import DocumentPrintActions from "../../../shared/components/DocumentPrintActions";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useQuotationPrintView } from "../hooks";
import QuotationPrintView from "./QuotationPrintView";

// Print and Download both come from DocumentPrintActions, which every
// printable document shares. The old "window.print() is enough, no PDF
// dependency" decision recorded in
// docs_about_the_phase_completion/phase5_frontend_progress.md was
// reversed once these documents started being SENT rather than only
// printed — see shared/utils/documentPdf.js for why.
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
      <DocumentPrintActions fileName={`Quotation ${quotation.quotationNumber}`} />
      <QuotationPrintView quotation={quotation} />
    </div>
  );
}
