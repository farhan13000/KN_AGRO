import { Plus, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import {
  LEAD_PRIORITIES,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "../constants";
import { useLeadList } from "../hooks";
import { getLeadCapabilities } from "../utils/leadCapabilities";
import LeadTable from "./LeadTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// The Create button is derived from the real `leads.create` permission,
// exactly as QuotationListView does (Prompt 46), rather than a `showCreate`
// flag each role page had to remember to set. The flag was the bug: only
// the Super Admin page ever passed it, so GM/RM/ASM — who all genuinely
// hold leads.create — had no way to create a lead anywhere in the app,
// while SO/FO/OA correctly have neither the permission nor the button.
export default function LeadListView({
  createPath = "",
  detailPath,
  emptyActionLabel = "",
  roleLabel = "CRM",
  showAssignments = true,
  showHeading = true,
  showPipelineValue = true,
  showSource = true,
  subtitle = "Review backend-scoped leads with server pagination, filters, and search.",
  title = "Leads",
}) {
  const { hasPermission } = useAuth();
  const { canCreateLead } = getLeadCapabilities({ hasPermission });
  const showCreate = canCreateLead && Boolean(createPath);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    status: getQueryValue(searchParams, "status"),
    priority: getQueryValue(searchParams, "priority"),
    source: getQueryValue(searchParams, "source"),
    sortBy: getQueryValue(searchParams, "sortBy", "createdAt"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
  };
  const leadsState = useLeadList(query);
  const leads = leadsState.data?.leads || [];
  const pagination = leadsState.data?.pagination || {};

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
        {showHeading ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{roleLabel}</p>
            <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
          </div>
        ) : null}
        {showCreate ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            to={createPath}
          >
            <Plus className="h-4 w-4" />
            Create Lead
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
                placeholder="Search lead code, name, company"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Priority</span>
            <select className="form-field" name="priority" onChange={handleFilterChange} value={query.priority}>
              <option value="">All priorities</option>
              {LEAD_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {LEAD_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </label>
          {showSource ? (
            <label>
              <span className="form-label">Source</span>
              <select className="form-field" name="source" onChange={handleFilterChange} value={query.source}>
                <option value="">All sources</option>
                {LEAD_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {LEAD_SOURCE_LABELS[source]}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="nextFollowUpAt">Next Follow-Up</option>
              <option value="expectedValue">Expected Value</option>
              <option value="priority">Priority</option>
              <option value="name">Name</option>
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

      {leadsState.isLoading ? <PageLoader message="Loading leads..." /> : null}
      {leadsState.isError ? <ErrorState message={leadsState.errorMessage} title="Unable to load leads" /> : null}
      {!leadsState.isLoading && !leadsState.isError && !leads.length ? (
        <EmptyState
          actionLabel={showCreate ? emptyActionLabel || "Create Lead" : undefined}
          actionTo={showCreate ? createPath : undefined}
          description="No leads matched the current filters."
          title="No leads found"
        />
      ) : null}
      {!leadsState.isLoading && !leadsState.isError && leads.length ? (
        <>
          <LeadTable
            detailPath={detailPath}
            leads={leads}
            showAssignments={showAssignments}
            showPipelineValue={showPipelineValue}
            showSource={showSource}
          />
          <Pagination
            ariaLabel="Lead pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
