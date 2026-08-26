import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { useLeadQuotations } from "../hooks";
import QuotationTable from "./QuotationTable";

// The most direct, backend-correct implementation of "filter quotations by
// Lead" (Prompt 36) — GET /leads/:leadId/quotations, not a generic Lead-ID
// picker bolted onto the global list. It also gives a tester somewhere to
// see whether a lead already has an active quotation before hitting the
// backend's duplicate-active-quotation 409 on Create.
export default function QuotationsForLeadSection({ detailPath, leadId }) {
  const quotationsState = useLeadQuotations(leadId, { limit: 10, sortBy: "createdAt", sortOrder: "desc" });
  const quotations = quotationsState.data?.quotations || [];

  if (!leadId) return null;

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Quotations</h2>
      {quotationsState.isLoading ? <p className="mt-3 text-sm text-muted">Loading quotations...</p> : null}
      {quotationsState.isError ? (
        <ErrorState message={quotationsState.errorMessage} title="Unable to load quotations" />
      ) : null}
      {!quotationsState.isLoading && !quotationsState.isError ? (
        quotations.length ? (
          <div className="mt-4">
            <QuotationTable detailPath={detailPath} quotations={quotations} />
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">No quotations exist for this lead yet.</p>
        )
      ) : null}
    </Card>
  );
}
