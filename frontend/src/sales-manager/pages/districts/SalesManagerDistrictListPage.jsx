import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { ROUTES } from "../../../shared/constants";
import { DistrictTable, useDistrictList } from "../../../features/districts";
import { useDebouncedValue } from "../../../shared/hooks";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function SalesManagerDistrictListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
  };
  const districtsState = useDistrictList(query);
  const districts = districtsState.data?.districts || [];
  const pagination = districtsState.data?.pagination || {};

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Districts</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Propose or act on manager assignments for districts you're involved with.
        </p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <label>
          <span className="form-label">Search</span>
          <span className="relative block max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="form-field pl-10"
              onChange={(event) => updateQuery({ search: event.target.value, page: 1 })}
              placeholder="Search name"
              type="search"
              value={searchInput}
            />
          </span>
        </label>
      </section>

      {districtsState.isLoading ? <PageLoader message="Loading districts..." /> : null}
      {districtsState.isError ? (
        <ErrorState message={districtsState.errorMessage} title="Unable to load districts" />
      ) : null}
      {!districtsState.isLoading && !districtsState.isError && !districts.length ? (
        <EmptyState description="No districts matched the current filters." title="No districts found" />
      ) : null}
      {!districtsState.isLoading && !districtsState.isError && districts.length ? (
        <>
          <DistrictTable
            districts={districts}
            getDetailHref={(district) => ROUTES.SALES_MANAGER.DISTRICT_DETAIL.replace(":districtId", district._id)}
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
