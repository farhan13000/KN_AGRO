import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { useCategoryList } from "../../../features/categories";
import { useProductList } from "../../../features/products";
import {
  INVENTORY_TRANSACTION_TYPE,
  InventoryTransactionTable,
  useInventoryTransactions,
} from "../../../features/inventory";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function SuperAdminInventoryTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    type: getQueryValue(searchParams, "type"),
    from: getQueryValue(searchParams, "from"),
    to: getQueryValue(searchParams, "to"),
    product: getQueryValue(searchParams, "product"),
    category: getQueryValue(searchParams, "category"),
    search: debouncedSearch,
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
  };
  const transactionState = useInventoryTransactions(query);
  const productState = useProductList({ limit: 100, sortBy: "name", sortOrder: "asc" });
  const categoryState = useCategoryList({ limit: 100, sortBy: "name", order: "asc" });
  const transactions = transactionState.data?.transactions || [];
  const pagination = transactionState.data?.pagination || {};
  const products = productState.data?.products || [];
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
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Inventory Ledger</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Transaction History</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Review immutable stock ledger records. Reserved, released, and sale transactions are read-only
          system-driven movements for future order workflows, not manual Phase 3 actions.
        </p>
      </div>

      <section className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <label className="xl:col-span-2">
            <span className="form-label">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="form-field pl-10"
                name="search"
                onChange={handleFilterChange}
                placeholder="Search transaction code"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Product</span>
            <select className="form-field" name="product" onChange={handleFilterChange} value={query.product}>
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
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
            <span className="form-label">Type</span>
            <select className="form-field" name="type" onChange={handleFilterChange} value={query.type}>
              <option value="">All types</option>
              {Object.values(INVENTORY_TRANSACTION_TYPE).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">From</span>
            <input className="form-field" name="from" onChange={handleFilterChange} type="date" value={query.from} />
          </label>
          <label>
            <span className="form-label">To</span>
            <input className="form-field" name="to" onChange={handleFilterChange} type="date" value={query.to} />
          </label>
          <label>
            <span className="form-label">Sort Order</span>
            <select className="form-field" name="sortOrder" onChange={handleFilterChange} value={query.sortOrder}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </label>
        </div>
      </section>

      {transactionState.isLoading ? <PageLoader message="Loading transactions..." /> : null}
      {transactionState.isError ? (
        <ErrorState message={transactionState.errorMessage} title="Unable to load transactions" />
      ) : null}
      {!transactionState.isLoading && !transactionState.isError && !transactions.length ? (
        <EmptyState
          description="No inventory transactions matched the current filters."
          title="No transactions found"
        />
      ) : null}
      {!transactionState.isLoading && !transactionState.isError && transactions.length ? (
        <>
          <InventoryTransactionTable transactions={transactions} />
          <Pagination
            ariaLabel="Inventory transaction pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}
    </div>
  );
}
