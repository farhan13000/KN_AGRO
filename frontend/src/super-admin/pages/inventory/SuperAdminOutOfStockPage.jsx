import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { useCategoryList } from "../../../features/categories";
import { InventoryThresholdTable, useOutOfStockInventory } from "../../../features/inventory";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function SuperAdminOutOfStockPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    category: getQueryValue(searchParams, "category"),
    sortBy: getQueryValue(searchParams, "sortBy", "availableStock"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "asc"),
  };
  const outOfStockState = useOutOfStockInventory(query);
  const categoryState = useCategoryList({ limit: 100, sortBy: "name", order: "asc" });
  const items = outOfStockState.data?.items || [];
  const pagination = outOfStockState.data?.pagination || {};
  const categories = categoryState.data?.categories || [];

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
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Inventory Control</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Out Of Stock</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Review products where backend-filtered available stock is zero or below.
        </p>
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
                placeholder="Search product or code"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Category</span>
            <select className="form-field" name="category" onChange={handleFilterChange} value={query.category}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="availableStock">Available Stock</option>
              <option value="currentStock">Current Stock</option>
              <option value="reservedStock">Reserved Stock</option>
              <option value="minimumStock">Minimum Stock</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label>
            <span className="form-label">Sort Order</span>
            <select className="form-field" name="sortOrder" onChange={handleFilterChange} value={query.sortOrder}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </section>

      {outOfStockState.isLoading ? <PageLoader message="Loading out-of-stock inventory..." /> : null}
      {outOfStockState.isError ? (
        <ErrorState message={outOfStockState.errorMessage} title="Unable to load out-of-stock inventory" />
      ) : null}
      {!outOfStockState.isLoading && !outOfStockState.isError && !items.length ? (
        <EmptyState
          description="No out-of-stock products matched the current filters."
          title="No out-of-stock products"
        />
      ) : null}
      {!outOfStockState.isLoading && !outOfStockState.isError && items.length ? (
        <>
          <InventoryThresholdTable items={items} mode="out" />
          <Pagination
            ariaLabel="Out of stock pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
