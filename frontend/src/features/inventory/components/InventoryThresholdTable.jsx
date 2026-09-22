import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { DataTable, rowActionClass } from "../../../shared/components";
import { ROUTES } from "../../../shared/constants";
import { getProductUnitLabel } from "../../products/utils";
import StockStatusBadge from "./StockStatusBadge";

const formatDateTime = (value) => {
  if (!value) return "No movement";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No movement";
  return parsed.toLocaleString();
};

const getProductId = (item) => item.product?._id || item.product;
const unitOf = (item) => getProductUnitLabel(item.unit || item.product?.unit);

export default function InventoryThresholdTable({ items = [], mode = "low" }) {
  const isOutOfStock = mode === "out";

  const columns = [
    {
      key: "product",
      header: "Product",
      role: "title",
      cell: (item) => (
        <>
          <p className="font-black text-ink">{item.product?.name || item.name || "Not Available"}</p>
          <p className="mt-1 text-xs font-semibold text-muted">
            {item.productCode || item.product?.productCode || ""}
          </p>
        </>
      ),
    },
    {
      key: "category",
      header: "Category",
      cellClassName: "text-muted",
      cell: (item) => item.category?.name || item.product?.category?.name || "Not Set",
    },
    isOutOfStock && {
      key: "currentStock",
      header: "Current Stock",
      cellClassName: "text-muted",
      cell: (item) => `${item.currentStock ?? 0} ${unitOf(item)}`,
    },
    isOutOfStock && {
      key: "reservedStock",
      header: "Reserved Stock",
      cellClassName: "text-muted",
      cell: (item) => `${item.reservedStock ?? 0} ${unitOf(item)}`,
    },
    {
      key: "availableStock",
      header: "Available Stock",
      cellClassName: "font-bold text-ink",
      cell: (item) => `${item.availableStock ?? 0} ${unitOf(item)}`,
    },
    {
      key: "minimumStock",
      header: "Minimum Stock",
      cellClassName: "text-muted",
      cell: (item) => `${item.minimumStock ?? 0} ${unitOf(item)}`,
    },
    !isOutOfStock && {
      key: "difference",
      header: "Difference",
      cellClassName: "font-bold text-ink",
      cell: (item) =>
        `${Math.max(Number(item.minimumStock || 0) - Number(item.availableStock || 0), 0)} ${unitOf(item)}`,
    },
    {
      key: "stockStatus",
      header: "Stock Status",
      role: "badge",
      cell: (item) => (
        <StockStatusBadge
          availableStock={item.availableStock}
          minimumStock={item.minimumStock}
          status={item.stockStatus}
        />
      ),
    },
    {
      key: "lastStockMovementAt",
      header: "Last Movement",
      cellClassName: "text-muted",
      cell: (item) => formatDateTime(item.lastStockMovementAt),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (item) => {
        const productId = getProductId(item);
        return (
          <div className="flex justify-end">
            {productId ? (
              <Link
                aria-label={`View inventory for ${item.product?.name || item.productCode}`}
                className={rowActionClass}
                to={`${ROUTES.SUPER_ADMIN.INVENTORY}/${productId}`}
              >
                <Eye className="h-4 w-4" />
                <span className="md:sr-only">View</span>
              </Link>
            ) : null}
          </div>
        );
      },
    },
  ].filter(Boolean);

  return (
    <DataTable columns={columns} minWidth="980px" rowKey={(item) => item._id || getProductId(item)} rows={items} />
  );
}
