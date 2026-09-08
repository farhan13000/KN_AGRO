import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { INVOICE_PAYMENT_STATUS_LABELS, INVOICE_PAYMENT_STATUSES, INVOICE_STATUS_LABELS, INVOICE_STATUSES } from "../constants";
import { useInvoiceList } from "../hooks";
import InvoiceTable from "./InvoiceTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// No Create button — an Invoice only ever originates from an eligible
// Order's own "Generate Invoice" action (Prompt 41, a later batch), never
// from this list.
export default function InvoiceListView({
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
  detailPath,
  emptyStateDescription = "No invoices matched the current filters.",
  emptyStateTitle = "No invoices found",
  roleLabel = "CRM",
  showHeading = true,
  subtitle = "Review invoices with server pagination, filters, and search.",
  title = "Invoices",
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    page: Number(getQueryValue(searchParams, "page", "1")),
    search: debouncedSearch,
    sortBy: getQueryValue(searchParams, "sortBy", defaultSortBy),
    sortOrder: getQueryValue(searchParams, "sortOrder", defaultSortOrder),
    status: getQueryValue(searchParams, "status"),
    paymentStatus: getQueryValue(searchParams, "paymentStatus"),
  };
  const invoicesState = useInvoiceList(query);
  const invoices = invoicesState.data?.invoices || [];
  const pagination = invoicesState.data?.pagination || {};

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const handleFilterChange = (event) => {
    updateQuery({ [event.target.name]: event.target.value, page: 1 });
  };

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
        </div>
      ) : null}

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="xl:col-span-2">
            <span className="form-label">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search invoice number, order number, customer"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Invoice Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {INVOICE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {INVOICE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Payment Status</span>
            <select
              className="form-field"
              name="paymentStatus"
              onChange={handleFilterChange}
              value={query.paymentStatus}
            >
              <option value="">All payment statuses</option>
              {INVOICE_PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {INVOICE_PAYMENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="invoiceDate">Invoice Date</option>
              <option value="dueDate">Due Date</option>
              <option value="grandTotal">Grand Total</option>
              <option value="invoiceNumber">Invoice Number</option>
            </select>
          </label>
        </div>
      </section>

      {invoicesState.isLoading ? <PageLoader message="Loading invoices..." /> : null}
      {invoicesState.isError ? (
        <ErrorState message={invoicesState.errorMessage} title="Unable to load invoices" />
      ) : null}
      {!invoicesState.isLoading && !invoicesState.isError && !invoices.length ? (
        <EmptyState description={emptyStateDescription} title={emptyStateTitle} />
      ) : null}
      {!invoicesState.isLoading && !invoicesState.isError && invoices.length ? (
        <>
          <InvoiceTable detailPath={detailPath} invoices={invoices} />
          <Pagination
            ariaLabel="Invoice pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
