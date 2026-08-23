import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { useCategoryList } from "../../../features/categories";
import { PRODUCT_STATUS } from "../../../features/products";
import {
  InventoryTable,
  STOCK_STATUS,
  useInventoryList,
  useInventorySummary,
} from "../../../features/inventory";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

const getSummaryCards = (summary = {}) => [
  { label: "Tracked Items", value: summary.totalItems ?? summary.totalProducts ?? 0 },
  { label: "Low Stock", value: summary.lowStockItems ?? 0 },
  { label: "Out Of Stock", value: summary.outOfStockItems ?? 0 },
  { label: "Available Units", value: summary.totalAvailableStock ?? 0 },
];

export default function SuperAdminInventoryOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    category: getQueryValue(searchParams, "category"),
    productStatus: getQueryValue(searchParams, "productStatus"),
    lowStock: getQueryValue(searchParams, "lowStock"),
    outOfStock: getQueryValue(searchParams, "outOfStock"),
    sortBy: getQueryValue(searchParams, "sortBy", "name"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "asc"),
  };
  const inventoryState = useInventoryList(query);
  const summaryState = useInventorySummary();
  const categoriesState = useCategoryList({ limit: 100, sortBy: "name", order: "asc" });
  const items = inventoryState.data?.items || [];
  const pagination = inventoryState.data?.pagination || {};
  const categories = categoriesState.data?.categories || [];

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
        <h1 className="mt-2 text-3xl font-black text-ink">Inventory</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Review stock levels, reserved quantities, reorder thresholds, and product-level inventory status.
        </p>
      </div>

      {!summaryState.isLoading && !summaryState.isError ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {getSummaryCards(summaryState.data).map((card) => (
            <Card className="p-5" key={card.label}>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-ink">{card.value}</p>
            </Card>
          ))}
        </div>
      ) : null}

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
            <span className="form-label">Product Status</span>
            <select className="form-field" name="productStatus" onChange={handleFilterChange} value={query.productStatus}>
              <option value="">All product statuses</option>
              {Object.values(PRODUCT_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Stock Status</span>
            <select
              className="form-field"
              onChange={(event) => {
                const value = event.target.value;
                updateQuery({
                  lowStock: value === STOCK_STATUS.LOW_STOCK ? "true" : "",
                  outOfStock: value === STOCK_STATUS.OUT_OF_STOCK ? "true" : "",
                  page: 1,
                });
              }}
              value={
                query.outOfStock === "true"
                  ? STOCK_STATUS.OUT_OF_STOCK
                  : query.lowStock === "true"
                    ? STOCK_STATUS.LOW_STOCK
                    : ""
              }
            >
              <option value="">All stock states</option>
              <option value={STOCK_STATUS.LOW_STOCK}>Low Stock</option>
              <option value={STOCK_STATUS.OUT_OF_STOCK}>Out Of Stock</option>
            </select>
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="name">Name</option>
              <option value="productCode">Product Code</option>
              <option value="currentStock">Current Stock</option>
              <option value="availableStock">Available Stock</option>
              <option value="reservedStock">Reserved Stock</option>
              <option value="minimumStock">Minimum Stock</option>
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

      {inventoryState.isLoading ? <PageLoader message="Loading inventory..." /> : null}
      {inventoryState.isError ? <ErrorState message={inventoryState.errorMessage} title="Unable to load inventory" /> : null}
      {!inventoryState.isLoading && !inventoryState.isError && !items.length ? (
        <EmptyState
          description="No inventory records matched the current filters."
          title="No inventory records found"
        />
      ) : null}
      {!inventoryState.isLoading && !inventoryState.isError && items.length ? (
        <>
          <InventoryTable items={items} />
          <Pagination
            ariaLabel="Inventory pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
