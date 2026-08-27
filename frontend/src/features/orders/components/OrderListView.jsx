import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { useDebouncedValue } from "../../../shared/hooks";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "../constants";
import { useOrderList } from "../hooks";
import OrderTable from "./OrderTable";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

// No Create button on this list — unlike Customers/Products, an Order has
// no standalone "create blank" flow. Every Order originates from an
// ACCEPTED Quotation's own "Create Order" action (Prompt 23,
// QuotationLifecycleActions) — never from this page.
export default function OrderListView({
  detailPath,
  roleLabel = "CRM",
  subtitle = "Review orders with server pagination, filters, and search.",
  title = "Orders",
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    page: Number(getQueryValue(searchParams, "page", "1")),
    search: debouncedSearch,
    sortBy: getQueryValue(searchParams, "sortBy", "createdAt"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
    orderStatus: getQueryValue(searchParams, "orderStatus"),
  };
  const ordersState = useOrderList(query);
  const orders = ordersState.data?.orders || [];
  const pagination = ordersState.data?.pagination || {};

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
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
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
                placeholder="Search order number"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select
              className="form-field"
              name="orderStatus"
              onChange={handleFilterChange}
              value={query.orderStatus}
            >
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="orderDate">Order Date</option>
              <option value="grandTotal">Order Value</option>
              <option value="orderNumber">Order Number</option>
              <option value="expectedDeliveryDate">Expected Delivery</option>
            </select>
          </label>
        </div>
      </section>

      {ordersState.isLoading ? <PageLoader message="Loading orders..." /> : null}
      {ordersState.isError ? (
        <ErrorState message={ordersState.errorMessage} title="Unable to load orders" />
      ) : null}
      {!ordersState.isLoading && !ordersState.isError && !orders.length ? (
        <EmptyState description="No orders matched the current filters." title="No orders found" />
      ) : null}
      {!ordersState.isLoading && !ordersState.isError && orders.length ? (
        <>
          <OrderTable detailPath={detailPath} orders={orders} />
          <Pagination
            ariaLabel="Order pagination"
            onPageChange={(page) => updateQuery({ page })}
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
          />
        </>
      ) : null}
    </div>
  );
}
