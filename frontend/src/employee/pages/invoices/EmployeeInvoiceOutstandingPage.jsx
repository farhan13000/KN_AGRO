import { ROUTES } from "../../../shared/constants";
import { InvoiceListView, InvoiceOutstandingSummary, useInvoiceSummary } from "../../../features/invoices";

export default function EmployeeInvoiceOutstandingPage() {
  const summaryState = useInvoiceSummary();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Outstanding Receivables</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Real, backend-aggregated totals across invoices tied to your own assigned leads, plus a browsable
          list.
        </p>
      </div>
      <InvoiceOutstandingSummary summaryState={summaryState} />
      <InvoiceListView
        defaultSortBy="dueDate"
        defaultSortOrder="asc"
        detailPath={(invoice) => `${ROUTES.EMPLOYEE.INVOICES}/${invoice._id}`}
        emptyStateDescription="No invoices matched the current filters."
        emptyStateTitle="No outstanding invoices."
        roleLabel="Employee CRM"
        subtitle="Filter by Payment Status to narrow to Unpaid, Partially Paid, or Overdue invoices."
        title="Invoices"
      />
    </div>
  );
}
