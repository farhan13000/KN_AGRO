import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../../../core/auth";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { DISTRICT_STATUS, DistrictTable, useDistrictList } from "../../../features/districts";
import { useRegionList } from "../../../features/regions";
import { useDebouncedValue } from "../../../shared/hooks";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function SuperAdminDistrictListPage() {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    status: getQueryValue(searchParams, "status"),
    region: getQueryValue(searchParams, "region"),
  };
  const districtsState = useDistrictList(query);
  const districts = districtsState.data?.districts || [];
  const pagination = districtsState.data?.pagination || {};
  const regionsState = useRegionList({ page: 1, limit: 100, status: "ACTIVE" });
  const regions = regionsState.data?.regions || [];
  const canCreate = hasPermission(PERMISSIONS.DISTRICT_CREATE);

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
          <h1 className="mt-2 text-3xl font-black text-ink">Districts</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Sub-geography within a region — each with an RM/ASM manager assignment workflow.
          </p>
        </div>
        {canCreate ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            to={ROUTES.SUPER_ADMIN.DISTRICT_CREATE}
          >
            <Plus className="h-4 w-4" />
            Create District
          </Link>
        ) : null}
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
                placeholder="Search name"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Region</span>
            <select className="form-field" name="region" onChange={handleFilterChange} value={query.region}>
              <option value="">All regions</option>
              {regions.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {Object.values(DISTRICT_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {districtsState.isLoading ? <PageLoader message="Loading districts..." /> : null}
      {districtsState.isError ? (
        <ErrorState message={districtsState.errorMessage} title="Unable to load districts" />
      ) : null}
      {!districtsState.isLoading && !districtsState.isError && !districts.length ? (
        <EmptyState
          actionLabel={canCreate ? "Create District" : undefined}
          actionTo={canCreate ? ROUTES.SUPER_ADMIN.DISTRICT_CREATE : undefined}
          description="No districts matched the current filters."
          title="No districts found"
        />
      ) : null}
      {!districtsState.isLoading && !districtsState.isError && districts.length ? (
        <>
          <DistrictTable
            districts={districts}
            getDetailHref={(district) => ROUTES.SUPER_ADMIN.DISTRICT_DETAIL.replace(":districtId", district._id)}
            getEditHref={(district) => ROUTES.SUPER_ADMIN.DISTRICT_EDIT.replace(":districtId", district._id)}
          />
          <Pagination
            ariaLabel="District pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
