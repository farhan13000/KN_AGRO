import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useQuotationDetail } from "../hooks";
import QuotationDetailView from "./QuotationDetailView";

export default function QuotationDetailRouteView({
  backTo,
  detailPathFor,
  editPathFor,
  leadDetailPathFor,
  printPathFor,
  roleLabel = "CRM",
}) {
  const navigate = useNavigate();
  const { quotationId } = useParams();
  const quotationState = useQuotationDetail(quotationId);
  const quotation = quotationState.data?.quotation;

  if (quotationState.isLoading) return <PageLoader message="Loading quotation..." />;
  if (quotationState.isError) {
    return <ErrorState message={quotationState.errorMessage} title="Unable to load quotation" />;
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

  // Revise creates a brand-new quotation record — Prompt 33 requires
  // navigating to it, never refetching the (unchanged) original.
  const handleRevised = (newQuotation) => {
    if (detailPathFor && newQuotation) navigate(detailPathFor(newQuotation));
  };

  return (
    <QuotationDetailView
      editPath={editPathFor ? editPathFor(quotation) : ""}
      leadDetailPath={leadDetailPathFor && quotation.lead ? leadDetailPathFor(quotation.lead) : ""}
      onMutationSuccess={quotationState.refetch}
      onRevised={handleRevised}
      parentDetailPath={
        quotation.parentQuotation && detailPathFor ? detailPathFor({ _id: quotation.parentQuotation }) : ""
      }
      printPath={printPathFor ? printPathFor(quotation) : ""}
      quotation={quotation}
      roleLabel={roleLabel}
    />
  );
}
