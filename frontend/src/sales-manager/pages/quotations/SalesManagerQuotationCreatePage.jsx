import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import { useLeadDetail } from "../../../features/leads";
import { QuotationBuilder, useQuotationActions } from "../../../features/quotations";

export default function SalesManagerQuotationCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId") || "";
  const leadState = useLeadDetail(leadId);
  const [submitError, setSubmitError] = useState("");

  const quotationActions = useQuotationActions({
    onSuccess: (payload) => {
      const quotationId = payload?.quotation?._id;
      navigate(quotationId ? `${ROUTES.SALES_MANAGER.QUOTATIONS}/${quotationId}` : ROUTES.SALES_MANAGER.QUOTATIONS);
    },
  });

  const handleSubmit = async (values) => {
    setSubmitError("");
    try {
      await quotationActions.createQuotation.mutate(values);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  if (leadId && leadState.isLoading) return <PageLoader message="Loading lead..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Manager CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Quotation</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Backend services remain responsible for the quotation number, DRAFT status, item snapshots, and every
          total.
        </p>
      </div>
      {leadId && leadState.isError ? (
        <ErrorState message={leadState.errorMessage} title="Unable to load the selected lead" />
      ) : null}
      <Card className="p-5">
        <QuotationBuilder
          initialLead={leadId ? leadState.data?.lead || null : null}
          isSubmitting={quotationActions.createQuotation.isLoading}
          onSubmit={handleSubmit}
          submitError={submitError}
        />
      </Card>
    </div>
  );
}
