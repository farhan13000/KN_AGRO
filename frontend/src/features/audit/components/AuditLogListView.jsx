import { useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { AUDIT_ACTIONS, titleCaseAuditValue } from "../constants";
import { useAuditLogList } from "../hooks";
import AuditLogDetailModal from "./AuditLogDetailModal";
import AuditLogTable from "./AuditLogTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function AuditLogListView({ description, portalLabel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailId, setDetailId] = useState(null);
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);

  const query = {
    limit: Number(getQueryValue(searchParams, "limit", "20")),
    page: Number(getQueryValue(searchParams, "page", "1")),
    search: debouncedSearch || undefined,
    action: getQueryValue(searchParams, "action") || undefined,
    entityType: getQueryValue(searchParams, "entityType") || undefined,
    entityId: getQueryValue(searchParams, "entityId") || undefined,
    from: getQueryValue(searchParams, "from") || undefined,
    to: getQueryValue(searchParams, "to") || undefined,
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
  };

  const { errorMessage, isError, isLoading, logs, pagination } = useAuditLogList(query);

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
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">{portalLabel}</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Audit Log</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="xl:col-span-2">
            <span className="form-label">Search description</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search audit descriptions"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Action</span>
            <select className="form-field" name="action" onChange={handleFilterChange} value={query.action || ""}>
              <option value="">All actions</option>
              {AUDIT_ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {titleCaseAuditValue(action)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Sort</span>
            <select className="form-field" name="sortOrder" onChange={handleFilterChange} value={query.sortOrder}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
          <label>
            <span className="form-label">Entity type</span>
            <input
              className="form-field"
              name="entityType"
              onChange={handleFilterChange}
              placeholder="e.g. Employee, District"
              type="text"
              value={getQueryValue(searchParams, "entityType")}
            />
          </label>
          <label>
            <span className="form-label">Entity ID</span>
            <input
              className="form-field"
              name="entityId"
              onChange={handleFilterChange}
              placeholder="Object ID"
              type="text"
              value={getQueryValue(searchParams, "entityId")}
            />
          </label>
          <label>
            <span className="form-label">From</span>
            <input
              className="form-field"
              name="from"
              onChange={handleFilterChange}
              type="date"
              value={getQueryValue(searchParams, "from")}
            />
          </label>
          <label>
            <span className="form-label">To</span>
            <input
              className="form-field"
              name="to"
              onChange={handleFilterChange}
              type="date"
              value={getQueryValue(searchParams, "to")}
            />
          </label>
        </div>
      </section>

      {isLoading ? <PageLoader message="Loading audit log..." /> : null}
      {isError ? <ErrorState message={errorMessage} title="Unable to load the audit log" /> : null}
      {!isLoading && !isError && !logs.length ? (
        <EmptyState description="No audit entries match the current filters." title="No audit entries found" />
      ) : null}
      {!isLoading && !isError && logs.length ? (
        <>
          <AuditLogTable logs={logs} onViewDetail={setDetailId} />
          <Pagination
            ariaLabel="Audit log pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}

      <AuditLogDetailModal auditId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
