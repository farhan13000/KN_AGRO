import { Link } from "react-router-dom";
import { Eye, Pencil, RefreshCw } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { DataTable, rowIconActionClass } from "../../../shared/components";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import StockStatusBadge from "../../inventory/components/StockStatusBadge";
import { formatProductPrice, getProductUnitLabel } from "../utils";
import ProductStatusBadge from "./ProductStatusBadge";

const getImageUrl = (product) =>
  product?.images?.find((image) => image.isPrimary)?.url || product?.images?.[0]?.url || "";

export default function ProductTable({ onStatusAction, products = [] }) {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE);
  const canManage = hasPermission(PERMISSIONS.PRODUCTS_MANAGE);

  const columns = [
    {
      key: "productCode",
      header: "Code",
      cellClassName: "font-black text-forest",
      cell: (product) => product.productCode,
    },
    {
      key: "image",
      header: "Image",
      // Hidden from the card: the card already leads with the name, and a
      // thumbnail row would push the useful fields below the fold.
      hideOnCard: true,
      cell: (product) => {
        const image = getImageUrl(product);
        return (
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-mint">
            {image ? (
              <img alt="" className="h-full w-full object-contain p-1" src={image} />
            ) : (
              <span className="text-xs font-black text-forest">KN</span>
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      header: "Name",
      role: "title",
      cellClassName: "font-black text-ink",
      cell: (product) => product.name,
    },
    {
      key: "category",
      header: "Category",
      cellClassName: "text-muted",
      cell: (product) => product.category?.name || "Not Set",
    },
    {
      key: "brand",
      header: "Brand",
      cellClassName: "text-muted",
      cell: (product) => product.brand || "Not Set",
    },
    {
      key: "unit",
      header: "Unit",
      cellClassName: "text-muted",
      cell: (product) => getProductUnitLabel(product.unit),
    },
    {
      key: "sellingPrice",
      header: "Selling Price",
      cellClassName: "font-bold text-ink",
      cell: (product) => formatProductPrice(product.sellingPrice),
    },
    {
      key: "minimumStock",
      header: "Minimum",
      cellClassName: "text-muted",
      cell: (product) => product.minimumStock ?? 0,
    },
    {
      key: "status",
      header: "Product Status",
      role: "badge",
      cell: (product) => <ProductStatusBadge status={product.status} />,
    },
    {
      key: "stockStatus",
      header: "Stock Status",
      role: "badge",
      cell: (product) => (
        <StockStatusBadge
          availableStock={product.stock?.availableStock}
          minimumStock={product.stock?.minimumStock ?? product.minimumStock}
          status={product.stock?.stockStatus}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (product) => (
        <div className="flex justify-end gap-2">
          <Link
            aria-label={`View ${product.name}`}
            className={rowIconActionClass}
            to={`${ROUTES.SUPER_ADMIN.PRODUCTS}/${product._id}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
          {canUpdate ? (
            <Link
              aria-label={`Edit ${product.name}`}
              className={rowIconActionClass}
              to={`${ROUTES.SUPER_ADMIN.PRODUCTS}/${product._id}/edit`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
          ) : null}
          {canManage ? (
            <button
              aria-label={`Change status for ${product.name}`}
              className={rowIconActionClass}
              onClick={() => onStatusAction?.(product)}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} minWidth="1120px" rows={products} />;
}
