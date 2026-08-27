import { Plus, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { CUSTOMER_STATUSES, CUSTOMER_STATUS_LABELS, CUSTOMER_TYPES, CUSTOMER_TYPE_LABELS } from "../constants";
import { useCustomerList } from "../hooks";
import { getCustomerCapabilities } from "../utils";
import CustomerTable from "./CustomerTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// Every filter here maps 1:1 to a backend-supported query param (see
// PHASE6_FRONTEND_API_CONTRACT.md) — Customer has no data scope at all
// (unrestricted shared master data), so unlike every other list in this
// app there is no per-role filtering to worry about, only permissions.
// The Create button is derived from `getCustomerCapabilities` (matching
// the fix applied to Quotations in Phase 5 Batch 5, applied here from the
// start rather than retrofitted later — consolidated into its own
// capabilities file in Phase 6 Batch 7, per the Prompt 62 audit).
export default function CustomerListView({
  createPath = "",
  detailPath,
  roleLabel = "CRM",
  subtitle = "Review customers with server pagination, filters, and search.",
  title = "Customers",
}) {
  const { hasPermission } = useAuth();
  const { canCreateCustomer } = getCustomerCapabilities({ hasPermission });
  const showCreate = canCreateCustomer && Boolean(createPath);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    page: Number(getQueryValue(searchParams, "page", "1")),
    search: debouncedSearch,
    sortBy: getQueryValue(searchParams, "sortBy", "createdAt"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
    status: getQueryValue(searchParams, "status"),
    type: getQueryValue(searchParams, "type"),
  };
  const customersState = useCustomerList(query);
  const customers = customersState.data?.customers || [];
  const pagination = customersState.data?.pagination || {};

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
            Create Customer
          </Link>
        ) : null}
      </div>

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
                placeholder="Search name, code, company, phone, email"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {CUSTOMER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {CUSTOMER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Type</span>
            <select className="form-field" name="type" onChange={handleFilterChange} value={query.type}>
              <option value="">All types</option>
              {CUSTOMER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CUSTOMER_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="name">Name</option>
              <option value="customerCode">Customer Code</option>
              <option value="creditLimit">Credit Limit</option>
            </select>
          </label>
        </div>
      </section>

      {customersState.isLoading ? <PageLoader message="Loading customers..." /> : null}
      {customersState.isError ? (
        <ErrorState message={customersState.errorMessage} title="Unable to load customers" />
      ) : null}
      {!customersState.isLoading && !customersState.isError && !customers.length ? (
        <EmptyState
          actionLabel={showCreate ? "Create Customer" : undefined}
          actionTo={showCreate ? createPath : undefined}
          description="No customers matched the current filters."
          title="No customers found"
        />
      ) : null}
      {!customersState.isLoading && !customersState.isError && customers.length ? (
        <>
          <CustomerTable customers={customers} detailPath={detailPath} />
          <Pagination
            ariaLabel="Customer pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
