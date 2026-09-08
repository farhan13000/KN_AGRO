import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { getApiErrorMessage } from "../../../core/api";
import { useAuth } from "../../../core/auth";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import Modal from "../../../shared/components/Modal";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { useDebouncedValue } from "../../../shared/hooks";
import { useCategoryList } from "../../../features/categories";
import {
  PRODUCT_STATUS,
  PRODUCT_UNIT_LABELS,
  ProductTable,
  useProductActions,
  useProductList,
  useProductSummary,
} from "../../../features/products";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

const summaryCards = (summary = {}) => [
  { label: "Total Products", value: summary.totalProducts ?? 0 },
  { label: "Active", value: summary.activeProducts ?? 0 },
  { label: "Inactive", value: summary.inactiveProducts ?? 0 },
  { label: "Discontinued", value: summary.discontinuedProducts ?? 0 },
];

export default function SuperAdminProductListPage({ showHeading = true }) {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusProduct, setStatusProduct] = useState(null);
  const [nextStatus, setNextStatus] = useState(PRODUCT_STATUS.ACTIVE);
  const [statusError, setStatusError] = useState("");
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    category: getQueryValue(searchParams, "category"),
    brand: getQueryValue(searchParams, "brand"),
    status: getQueryValue(searchParams, "status"),
    unit: getQueryValue(searchParams, "unit"),
    minPrice: getQueryValue(searchParams, "minPrice"),
    maxPrice: getQueryValue(searchParams, "maxPrice"),
    sortBy: getQueryValue(searchParams, "sortBy", "createdAt"),
    sortOrder: getQueryValue(searchParams, "sortOrder", "desc"),
  };
  const productsState = useProductList(query);
  const summaryState = useProductSummary();
  const categoriesState = useCategoryList({ limit: 100, sortBy: "name", order: "asc" });
  const products = productsState.data?.products || [];
  const pagination = productsState.data?.pagination || {};
  const categories = categoriesState.data?.categories || [];
  const canCreateProducts = hasPermission(PERMISSIONS.PRODUCTS_CREATE);
  const productActions = useProductActions({
    onSuccess: () => {
      productsState.refetch();
      summaryState.refetch();
      setStatusProduct(null);
      setStatusError("");
    },
  });

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

  const openStatusModal = (product) => {
    setStatusProduct(product);
    setNextStatus(product.status || PRODUCT_STATUS.ACTIVE);
    setStatusError("");
  };

  const confirmStatusChange = async () => {
    if (!statusProduct) return;
    try {
      await productActions.changeProductStatus.mutate(statusProduct._id, nextStatus);
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {showHeading ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Product Catalog</p>
            <h1 className="mt-2 text-3xl font-black text-ink">Products</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Manage product records, catalog status, price fields, and reorder settings from the backend API.
            </p>
          </div>
        ) : null}
        {canCreateProducts ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            to={ROUTES.SUPER_ADMIN.PRODUCT_CREATE}
          >
            <Plus className="h-4 w-4" />
            Create Product
          </Link>
        ) : null}
      </div>

      {!summaryState.isLoading && !summaryState.isError ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards(summaryState.data).map((card) => (
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
                placeholder="Search code, name, brand"
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
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {Object.values(PRODUCT_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Unit</span>
            <select className="form-field" name="unit" onChange={handleFilterChange} value={query.unit}>
              <option value="">All units</option>
              {Object.entries(PRODUCT_UNIT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Brand</span>
            <input className="form-field" name="brand" onChange={handleFilterChange} type="text" value={query.brand} />
          </label>
          <label>
            <span className="form-label">Min Price</span>
            <input className="form-field" min="0" name="minPrice" onChange={handleFilterChange} type="number" value={query.minPrice} />
          </label>
          <label>
            <span className="form-label">Max Price</span>
            <input className="form-field" min="0" name="maxPrice" onChange={handleFilterChange} type="number" value={query.maxPrice} />
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="createdAt">Created</option>
              <option value="name">Name</option>
              <option value="productCode">Product Code</option>
              <option value="sellingPrice">Selling Price</option>
              <option value="updatedAt">Updated</option>
            </select>
          </label>
          <label>
            <span className="form-label">Sort Order</span>
            <select className="form-field" name="sortOrder" onChange={handleFilterChange} value={query.sortOrder}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>
      </section>

      {productsState.isLoading ? <PageLoader message="Loading products..." /> : null}
      {productsState.isError ? <ErrorState message={productsState.errorMessage} title="Unable to load products" /> : null}
      {!productsState.isLoading && !productsState.isError && !products.length ? (
        <EmptyState
          actionLabel={canCreateProducts ? "Create Product" : undefined}
          actionTo={canCreateProducts ? ROUTES.SUPER_ADMIN.PRODUCT_CREATE : undefined}
          description="No products matched the current filters."
          title="No products found"
        />
      ) : null}
      {!productsState.isLoading && !productsState.isError && products.length ? (
        <>
          <ProductTable onStatusAction={openStatusModal} products={products} />
          <Pagination
            ariaLabel="Product pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}

      <Modal
        isOpen={Boolean(statusProduct)}
        onClose={() => setStatusProduct(null)}
        title="Change product status"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted">
            Update catalog status for <span className="font-bold text-ink">{statusProduct?.name}</span>.
            Discontinued products should only be used when the product should no longer be sold.
          </p>
          <label>
            <span className="form-label">Next Status</span>
            <select className="form-field" onChange={(event) => setNextStatus(event.target.value)} value={nextStatus}>
              {Object.values(PRODUCT_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          {statusError ? <p className="text-sm font-semibold text-red-700">{statusError}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => setStatusProduct(null)} variant="secondary">
              Cancel
            </Button>
            <Button disabled={productActions.changeProductStatus.isLoading} onClick={confirmStatusChange}>
              {productActions.changeProductStatus.isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
