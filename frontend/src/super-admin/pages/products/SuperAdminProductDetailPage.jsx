import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { History, Pencil, RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "../../../core/api";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import Modal from "../../../shared/components/Modal";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import StockStatusBadge from "../../../features/inventory/components/StockStatusBadge";
import {
  PRODUCT_STATUS,
  ProductImageDisplay,
  ProductStatusBadge,
  SpecificationsDisplay,
  formatProductPrice,
  getProductUnitLabel,
  useProductActions,
  useProductDetail,
} from "../../../features/products";

const formatDateTime = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleString();
};

const DetailRow = ({ label, value }) => (
  <div className="rounded-lg border border-forest/10 bg-white px-4 py-3">
    <dt className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</dt>
    <dd className="mt-1 text-sm font-semibold leading-6 text-ink">{value}</dd>
  </div>
);

export default function SuperAdminProductDetailPage() {
  const { productId } = useParams();
  const { hasPermission } = useAuth();
  const productState = useProductDetail(productId);
  const product = productState.data?.product;
  const stock = product?.stock || product?.inventory || {};
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState(product?.status || PRODUCT_STATUS.ACTIVE);
  const [statusError, setStatusError] = useState("");
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE);
  const canManage = hasPermission(PERMISSIONS.PRODUCTS_MANAGE);
  const productActions = useProductActions({
    onSuccess: () => {
      productState.refetch();
      setIsStatusOpen(false);
      setStatusError("");
    },
  });

  const openStatusModal = () => {
    setNextStatus(product?.status || PRODUCT_STATUS.ACTIVE);
    setStatusError("");
    setIsStatusOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!product) return;
    try {
      await productActions.changeProductStatus.mutate(product._id, nextStatus);
    } catch (error) {
      setStatusError(getApiErrorMessage(error));
    }
  };

  if (productState.isLoading) return <PageLoader message="Loading product..." />;
  if (productState.isError) {
    return <ErrorState message={productState.errorMessage} title="Unable to load product" />;
  }
  if (!product) {
    return (
      <EmptyState
        actionLabel="Back To Products"
        actionTo={ROUTES.SUPER_ADMIN.PRODUCTS}
        description="The selected product could not be found."
        title="Product not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Product Catalog</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{product.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {product.productCode || "Product code pending"} | {product.category?.name || "Uncategorized"}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {canManage ? (
            <Button onClick={openStatusModal} variant="secondary">
              <RefreshCw className="h-4 w-4" />
              Status
            </Button>
          ) : null}
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            to={`${ROUTES.SUPER_ADMIN.INVENTORY}/${product._id}`}
          >
            <History className="h-4 w-4" />
            Inventory
          </Link>
          {canUpdate ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-agriculture"
              to={`${ROUTES.SUPER_ADMIN.PRODUCTS}/${product._id}/edit`}
            >
              <Pencil className="h-4 w-4" />
              Edit Product
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="p-5">
          <ProductImageDisplay images={product.images} name={product.name} />
        </Card>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <ProductStatusBadge status={product.status} />
            <StockStatusBadge
              availableStock={stock.availableStock}
              minimumStock={stock.minimumStock ?? product.minimumStock}
              status={stock.stockStatus}
            />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailRow label="Product Code" value={product.productCode || "Not Set"} />
            <DetailRow label="Slug" value={product.slug || "Not Set"} />
            <DetailRow label="Category" value={product.category?.name || "Not Set"} />
            <DetailRow label="Brand" value={product.brand || "Not Set"} />
            <DetailRow label="Unit" value={getProductUnitLabel(product.unit)} />
            <DetailRow label="Selling Price" value={formatProductPrice(product.sellingPrice)} />
            <DetailRow label="Purchase Price" value={formatProductPrice(product.purchasePrice)} />
            <DetailRow label="Tax Rate" value={`${product.taxRate ?? 0}%`} />
            <DetailRow label="Minimum Stock" value={product.minimumStock ?? 0} />
            <DetailRow label="Created" value={formatDateTime(product.createdAt)} />
            <DetailRow label="Updated" value={formatDateTime(product.updatedAt)} />
            <DetailRow label="Current Stock" value={stock.currentStock ?? 0} />
            <DetailRow label="Reserved Stock" value={stock.reservedStock ?? 0} />
            <DetailRow label="Available Stock" value={stock.availableStock ?? 0} />
            <DetailRow label="Last Movement" value={formatDateTime(stock.lastStockMovementAt)} />
          </dl>
          {product.shortDescription ? (
            <p className="rounded-lg border border-forest/10 bg-mint px-4 py-3 text-sm font-semibold leading-6 text-muted">
              {product.shortDescription}
            </p>
          ) : null}
          {product.description ? (
            <p className="text-sm leading-7 text-muted">{product.description}</p>
          ) : null}
        </div>
      </div>

      <SpecificationsDisplay specifications={product.specifications} />

      <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title="Change product status">
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted">
            Update status for <span className="font-bold text-ink">{product.name}</span>. Use Discontinued only
            when the product should no longer be part of active selling workflows.
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
            <Button onClick={() => setIsStatusOpen(false)} variant="secondary">
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
