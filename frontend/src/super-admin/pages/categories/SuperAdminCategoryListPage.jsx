import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { getApiErrorMessage } from "../../../core/api";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import Pagination from "../../../shared/components/Pagination";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import {
  CATEGORY_STATUS,
  CategoryTable,
  useCategoryActions,
  useCategoryList,
} from "../../../features/categories";
import { useDebouncedValue } from "../../../shared/hooks";

const getQueryValue = (searchParams, key, fallback = "") => searchParams.get(key) || fallback;

export default function SuperAdminCategoryListPage() {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const searchInput = getQueryValue(searchParams, "search");
  const debouncedSearch = useDebouncedValue(searchInput);
  const query = {
    page: Number(getQueryValue(searchParams, "page", "1")),
    limit: Number(getQueryValue(searchParams, "limit", "10")),
    search: debouncedSearch,
    status: getQueryValue(searchParams, "status"),
    sortBy: getQueryValue(searchParams, "sortBy", "sortOrder"),
    order: getQueryValue(searchParams, "order", "asc"),
  };
  const categoriesState = useCategoryList(query);
  const categories = categoriesState.data?.categories || [];
  const pagination = categoriesState.data?.pagination || {};
  const canManageCategories = hasPermission(PERMISSIONS.CATEGORIES_MANAGE);

  const categoryActions = useCategoryActions({
    onSuccess: () => {
      categoriesState.refetch();
      setPendingStatus(null);
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

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    try {
      await categoryActions.changeCategoryStatus.mutate(
        pendingStatus.category._id,
        pendingStatus.nextStatus,
      );
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Catalog Setup</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Categories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Maintain catalog categories with backend search, sort order, and safe status updates.
          </p>
        </div>
        {canManageCategories ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
            to={ROUTES.SUPER_ADMIN.CATEGORY_CREATE}
          >
            <Plus className="h-4 w-4" />
            Create Category
          </Link>
        ) : null}
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
                placeholder="Search name or slug"
                type="search"
                value={searchInput}
              />
            </span>
          </label>
          <label>
            <span className="form-label">Status</span>
            <select className="form-field" name="status" onChange={handleFilterChange} value={query.status}>
              <option value="">All statuses</option>
              {Object.values(CATEGORY_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="form-label">Sort By</span>
            <select className="form-field" name="sortBy" onChange={handleFilterChange} value={query.sortBy}>
              <option value="sortOrder">Sort Order</option>
              <option value="name">Name</option>
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
            </select>
          </label>
          <label>
            <span className="form-label">Order</span>
            <select className="form-field" name="order" onChange={handleFilterChange} value={query.order}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </section>

      {categoriesState.isLoading ? <PageLoader message="Loading categories..." /> : null}
      {categoriesState.isError ? (
        <ErrorState message={categoriesState.errorMessage} title="Unable to load categories" />
      ) : null}
      {!categoriesState.isLoading && !categoriesState.isError && !categories.length ? (
        <EmptyState
          actionLabel={canManageCategories ? "Create Category" : undefined}
          actionTo={canManageCategories ? ROUTES.SUPER_ADMIN.CATEGORY_CREATE : undefined}
          description="No categories matched the current filters."
          title="No categories found"
        />
      ) : null}
      {!categoriesState.isLoading && !categoriesState.isError && categories.length ? (
        <>
          <CategoryTable
            categories={categories}
            onStatusChange={(category, nextStatus) => setPendingStatus({ category, nextStatus })}
          />
          <Pagination
            ariaLabel="Category pagination"
            page={pagination.page || query.page}
            totalPages={pagination.pages || 1}
            onPageChange={(page) => updateQuery({ page })}
          />
        </>
      ) : null}

      <ConfirmDialog
        confirmLabel={categoryActions.changeCategoryStatus.isLoading ? "Updating..." : "Update Status"}
        description={
          pendingStatus
            ? `Set ${pendingStatus.category.name} to ${pendingStatus.nextStatus}. This changes public catalog visibility.`
            : ""
        }
        isOpen={Boolean(pendingStatus)}
        onCancel={() => {
          setPendingStatus(null);
          setStatusError("");
        }}
        onConfirm={confirmStatusChange}
        title="Change category status"
      />
      {statusError ? <p className="text-sm font-semibold text-red-700">{statusError}</p> : null}
    </div>
  );
}
