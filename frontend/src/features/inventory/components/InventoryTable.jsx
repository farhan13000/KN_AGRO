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

export default function InventoryTable({ items = [] }) {
  const columns = [
    {
      key: "productCode",
      header: "Product Code",
      cellClassName: "font-black text-forest",
      cell: (item) => item.productCode,
    },
    {
      key: "product",
      header: "Product",
      role: "title",
      cellClassName: "font-black text-ink",
      cell: (item) => item.product?.name || "Not Available",
    },
    {
      key: "category",
      header: "Category",
      cellClassName: "text-muted",
      cell: (item) => item.category?.name || "Not Set",
    },
    {
      key: "unit",
      header: "Unit",
      cellClassName: "text-muted",
      cell: (item) => getProductUnitLabel(item.unit),
    },
    {
      key: "currentStock",
      header: "Current",
      cellClassName: "text-muted",
      cell: (item) => item.currentStock ?? 0,
    },
    {
      key: "reservedStock",
      header: "Reserved",
      cellClassName: "text-muted",
      cell: (item) => item.reservedStock ?? 0,
    },
    {
      key: "availableStock",
      header: "Available",
      cellClassName: "font-bold text-ink",
      cell: (item) => item.availableStock ?? 0,
    },
    {
      key: "minimumStock",
      header: "Minimum",
      cellClassName: "text-muted",
      cell: (item) => item.minimumStock ?? 0,
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
      cell: (item) => (
        <div className="flex justify-end">
          <Link
            aria-label={`View inventory for ${item.product?.name || item.productCode}`}
            className={rowActionClass}
            to={`${ROUTES.SUPER_ADMIN.INVENTORY}/${item.product?._id}`}
          >
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">View</span>
          </Link>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} minWidth="1080px" rowKey={(item) => item._id || item.product?._id} rows={items} />;
}
