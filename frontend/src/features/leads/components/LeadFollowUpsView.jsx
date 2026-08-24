import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { useFollowUps } from "../hooks";
import LeadTable from "./LeadTable";

const followUpKinds = [
  { label: "Today", value: "today" },
  { label: "Overdue", value: "overdue" },
  { label: "Upcoming", value: "upcoming" },
];

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function LeadFollowUpsView({
  detailPath,
  roleLabel = "CRM",
  showAssignments = true,
  showSource = true,
  title = "Follow-Ups",
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const kind = getQueryValue(searchParams, "kind", "today");
  const safeKind = followUpKinds.some((item) => item.value === kind) ? kind : "today";
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    from: safeKind === "upcoming" ? getQueryValue(searchParams, "from") : "",
    to: safeKind === "upcoming" ? getQueryValue(searchParams, "to") : "",
  };
  const followUpsState = useFollowUps(safeKind, query);
  const leads = followUpsState.data?.leads || [];
  const pagination = followUpsState.data?.pagination || {};

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
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Follow-up lists are loaded from backend scoped endpoints for today, overdue, and upcoming work.
        </p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label>
            <span className="form-label">Follow-Up Window</span>
            <select className="form-field" name="kind" onChange={handleFilterChange} value={safeKind}>
              {followUpKinds.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
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
          {safeKind === "upcoming" ? (
            <>
              <label>
                <span className="form-label">From</span>
                <input
                  className="form-field"
                  name="from"
                  onChange={handleFilterChange}
                  type="date"
                  value={query.from}
                />
              </label>
              <label>
                <span className="form-label">To</span>
                <input
                  className="form-field"
                  name="to"
                  onChange={handleFilterChange}
                  type="date"
                  value={query.to}
                />
              </label>
            </>
          ) : null}
        </div>
      </section>

      {followUpsState.isLoading ? <PageLoader message="Loading follow-ups..." /> : null}
      {followUpsState.isError ? (
        <ErrorState message={followUpsState.errorMessage} title="Unable to load follow-ups" />
      ) : null}
      {!followUpsState.isLoading && !followUpsState.isError && !leads.length ? (
        <EmptyState
          description="No leads matched this follow-up window."
          title="No follow-ups found"
        />
      ) : null}
      {!followUpsState.isLoading && !followUpsState.isError && leads.length ? (
        <>
          <LeadTable
            detailPath={detailPath}
            leads={leads}
            showAssignments={showAssignments}
            showSource={showSource}
          />
          <Pagination
            ariaLabel="Follow-up pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
