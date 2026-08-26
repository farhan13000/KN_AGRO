import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import {
  QUOTATION_STATUS,
  QuotationBuilder,
  formatQuotationStatus,
  useQuotationActions,
  useQuotationDetail,
} from "../../../features/quotations";

export default function SuperAdminQuotationEditPage() {
  const navigate = useNavigate();
  const { quotationId } = useParams();
  const quotationState = useQuotationDetail(quotationId);
  const quotation = quotationState.data?.quotation;
  const [submitError, setSubmitError] = useState("");

  const quotationActions = useQuotationActions({
    onSuccess: () => navigate(`${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotationId}`),
  });

  const handleSubmit = async (values) => {
    setSubmitError("");
    try {
      await quotationActions.updateQuotation.mutate(quotationId, values);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
      // Prompt 50 / the race noted in Prompt 26: if this failed because the
      // quotation left DRAFT between load and submit (someone else sent it,
      // say), refetching re-syncs `quotation.status` so the DRAFT-only gate
      // above correctly swaps in the "not editable" block on the next
      // render, instead of leaving a stale, now-invalid form on screen.
      quotationState.refetch();
    }
  };

  if (quotationState.isLoading) return <PageLoader message="Loading quotation..." />;
  if (quotationState.isError) {
    return <ErrorState message={quotationState.errorMessage} title="Unable to load quotation" />;
  }
  if (!quotation) {
    return (
      <EmptyState
        actionLabel="Back To Quotations"
        actionTo={ROUTES.SUPER_ADMIN.QUOTATIONS}
        description="The selected quotation could not be found or is outside your allowed scope."
        title="Quotation not found"
      />
    );
  }

  // A direct URL to edit a non-DRAFT quotation must not expose a working
  // form — checked against the actually-fetched record, never a hidden
  // button alone. Only DRAFT is editable (backend EDITABLE_STATUSES).
  if (quotation.status !== QUOTATION_STATUS.DRAFT) {
    return (
      <EmptyState
        actionLabel="View Quotation"
        actionTo={`${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotationId}`}
        description={`${quotation.quotationNumber} is ${formatQuotationStatus(
          quotation.status,
        )} and can no longer be edited. Only Draft quotations are editable.`}
        title="This quotation is not editable"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit {quotation.quotationNumber}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Only Draft quotations are editable. The Lead cannot be changed once a quotation exists.
        </p>
      </div>
      <Card className="p-5">
        <QuotationBuilder
          initialQuotation={quotation}
          isSubmitting={quotationActions.updateQuotation.isLoading}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      </Card>
    </div>
  );
}
