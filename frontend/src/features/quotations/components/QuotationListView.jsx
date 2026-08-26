import { Plus, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { QUOTATION_STATUSES, QUOTATION_STATUS_LABELS } from "../constants";
import { useQuotationList } from "../hooks";
import { getQuotationCapabilities } from "../utils";
import QuotationTable from "./QuotationTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// Every filter here maps 1:1 to a backend-supported query param (see
// PHASE5_FRONTEND_API_CONTRACT.md) — the backend applies scope and does the
// actual filtering; this view never fetches globally and trims client-side.
//
// The Create button is derived from the real `quotations.create` permission
// (Prompt 46) rather than a `showCreate` flag each role page had to set
// correctly by hand — Employee simply never has the permission, so it
// naturally never sees the button, with one less way for a role page to
// get this wrong.
export default function QuotationListView({
  createPath = "",
  detailPath,
  roleLabel = "CRM",
  subtitle = "Review backend-scoped quotations with server pagination, filters, and search.",
  title = "Quotations",
}) {
  const { hasPermission } = useAuth();
  const { canCreateQuotation } = getQuotationCapabilities({ hasPermission });
  const showCreate = canCreateQuotation && Boolean(createPath);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    from: getQueryValue(searchParams, "from"),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    page: Number(getQueryValue(searchParams, "page", "1")),
    search: debouncedSearch,
    sortBy: getQueryValue(searchParams, "sortBy", "createdAt"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
    status: getQueryValue(searchParams, "status"),
    to: getQueryValue(searchParams, "to"),
  };
  const quotationsState = useQuotationList(query);
  const quotations = quotationsState.data?.quotations || [];
  const pagination = quotationsState.data?.pagination || {};

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
        </div>
        {showCreate ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            to={createPath}
          >
            <Plus className="h-4 w-4" />
            Create Quotation
          </Link>
        ) : null}
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="xl:col-span-2">
            <span className="form-label">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search quotation number, lead, company"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {QUOTATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {QUOTATION_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">From</span>
            <input className="form-field" name="from" onChange={handleFilterChange} type="date" value={query.from} />
          </label>
          <label>
            <span className="form-label">To</span>
            <input className="form-field" name="to" onChange={handleFilterChange} type="date" value={query.to} />
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="validUntil">Validity</option>
              <option value="grandTotal">Grand Total</option>
              <option value="quotationNumber">Quotation Number</option>
            </select>
          </label>
          <label>
            <span className="form-label">Sort Order</span>
            <select className="form-field" name="sortOrder" onChange={handleFilterChange} value={query.sortOrder}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>
      </section>

      {quotationsState.isLoading ? <PageLoader message="Loading quotations..." /> : null}
      {quotationsState.isError ? (
        <ErrorState message={quotationsState.errorMessage} title="Unable to load quotations" />
      ) : null}
      {!quotationsState.isLoading && !quotationsState.isError && !quotations.length ? (
        <EmptyState
          actionLabel={showCreate ? "Create Quotation" : undefined}
          actionTo={showCreate ? createPath : undefined}
          description="No quotations matched the current filters."
          title="No quotations found"
        />
      ) : null}
      {!quotationsState.isLoading && !quotationsState.isError && quotations.length ? (
        <>
          <QuotationTable detailPath={detailPath} quotations={quotations} />
          <Pagination
            ariaLabel="Quotation pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
