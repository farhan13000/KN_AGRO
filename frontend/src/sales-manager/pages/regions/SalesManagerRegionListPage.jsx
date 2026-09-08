import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { RegionTable, useRegionList } from "../../../features/regions";
import { useDebouncedValue } from "../../../shared/hooks";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function SalesManagerRegionListPage({ showHeading = true }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
  };
  const regionsState = useRegionList(query);
  const regions = regionsState.data?.regions || [];
  const pagination = regionsState.data?.pagination || {};

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
      {showHeading ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Regions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Reference geography for your assigned districts.
          </p>
        </div>
      ) : null}

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

      {regionsState.isLoading ? <PageLoader message="Loading regions..." /> : null}
      {regionsState.isError ? (
        <ErrorState message={regionsState.errorMessage} title="Unable to load regions" />
      ) : null}
      {!regionsState.isLoading && !regionsState.isError && !regions.length ? (
        <EmptyState description="No regions matched the current filters." title="No regions found" />
      ) : null}
      {!regionsState.isLoading && !regionsState.isError && regions.length ? (
        <>
          <RegionTable regions={regions} />
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
