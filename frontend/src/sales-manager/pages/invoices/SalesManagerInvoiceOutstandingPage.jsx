import { ROUTES } from "../../../shared/constants";
import { InvoiceListView, InvoiceOutstandingSummary, useInvoiceSummary } from "../../../features/invoices";

export default function SalesManagerInvoiceOutstandingPage({ showHeading = true }) {
  const summaryState = useInvoiceSummary();

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Manager CRM</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Outstanding Receivables</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Real, backend-aggregated totals across every invoice you can see, plus a browsable, sortable list.
          </p>
        </div>
      ) : null}
      <InvoiceOutstandingSummary summaryState={summaryState} />
      <InvoiceListView
        defaultSortBy="dueDate"
        defaultSortOrder="asc"
        detailPath={(invoice) => `${ROUTES.SALES_MANAGER.INVOICES}/${invoice._id}`}
        emptyStateDescription="No invoices matched the current filters."
        emptyStateTitle="No outstanding invoices."
        roleLabel="Manager CRM"
        showHeading={false}
        subtitle="Filter by Payment Status to narrow to Unpaid, Partially Paid, or Overdue invoices."
        title="Invoices"
      />
    </div>
  );
}
