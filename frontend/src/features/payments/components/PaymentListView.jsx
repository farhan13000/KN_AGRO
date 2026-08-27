import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "../constants";
import { usePaymentList } from "../hooks";
import PaymentTable from "./PaymentTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// Prompt 50: read-only global list, no Create button — Payments are only
// ever recorded from an eligible Invoice's own Record Payment action
// (Prompt 46), never from here.
export default function PaymentListView({
  invoiceDetailPathFor,
  roleLabel = "CRM",
  subtitle = "All recorded payments across every invoice, with method filter and search.",
  title = "Payments",
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    page: Number(getQueryValue(searchParams, "page", "1")),
    search: debouncedSearch,
    sortBy: getQueryValue(searchParams, "sortBy", "createdAt"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
    method: getQueryValue(searchParams, "method"),
  };
  const paymentsState = usePaymentList(query);
  const payments = paymentsState.data?.payments || [];
  const pagination = paymentsState.data?.pagination || {};

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
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="xl:col-span-2">
            <span className="form-label">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search payment number, reference"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Method</span>
            <select className="form-field" name="method" onChange={handleFilterChange} value={query.method}>
              <option value="">All methods</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="paymentDate">Payment Date</option>
              <option value="amount">Amount</option>
              <option value="paymentNumber">Payment Number</option>
            </select>
          </label>
        </div>
      </section>

      {paymentsState.isLoading ? <PageLoader message="Loading payments..." /> : null}
      {paymentsState.isError ? (
        <ErrorState message={paymentsState.errorMessage} title="Unable to load payments" />
      ) : null}
      {!paymentsState.isLoading && !paymentsState.isError && !payments.length ? (
        <EmptyState description="No payments matched the current filters." title="No payments recorded." />
      ) : null}
      {!paymentsState.isLoading && !paymentsState.isError && payments.length ? (
        <>
          <PaymentTable invoiceDetailPathFor={invoiceDetailPathFor} payments={payments} />
          <Pagination
            ariaLabel="Payment pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
