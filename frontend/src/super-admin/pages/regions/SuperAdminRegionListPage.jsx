import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { REGION_STATUS, RegionTable, useRegionList } from "../../../features/regions";
import { useDebouncedValue } from "../../../shared/hooks";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function SuperAdminRegionListPage() {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    status: getQueryValue(searchParams, "status"),
  };
  const regionsState = useRegionList(query);
  const regions = regionsState.data?.regions || [];
  const pagination = regionsState.data?.pagination || {};
  const canCreate = hasPermission(PERMISSIONS.REGION_CREATE);

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
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Regions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Top-level geography the sales organization is divided into.
          </p>
        </div>
        {canCreate ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            to={ROUTES.SUPER_ADMIN.REGION_CREATE}
          >
            <Plus className="h-4 w-4" />
            Create Region
          </Link>
        ) : null}
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="xl:col-span-2">
            <span className="form-label">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search name"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {Object.values(REGION_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {regionsState.isLoading ? <PageLoader message="Loading regions..." /> : null}
      {regionsState.isError ? (
        <ErrorState message={regionsState.errorMessage} title="Unable to load regions" />
      ) : null}
      {!regionsState.isLoading && !regionsState.isError && !regions.length ? (
        <EmptyState
          actionLabel={canCreate ? "Create Region" : undefined}
          actionTo={canCreate ? ROUTES.SUPER_ADMIN.REGION_CREATE : undefined}
          description="No regions matched the current filters."
          title="No regions found"
        />
      ) : null}
      {!regionsState.isLoading && !regionsState.isError && regions.length ? (
        <>
          <RegionTable
            getEditHref={(region) => ROUTES.SUPER_ADMIN.REGION_EDIT.replace(":regionId", region._id)}
            regions={regions}
          />
          <Pagination
            ariaLabel="Region pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
