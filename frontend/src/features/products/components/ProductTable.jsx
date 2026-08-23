import { Link } from "react-router-dom";
import { Eye, Pencil, RefreshCw } from "lucide-react";
import { useAuth } from "../../../core/auth";
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

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Selling Price</th>
              <th className="px-4 py-3">Minimum</th>
              <th className="px-4 py-3">Product Status</th>
              <th className="px-4 py-3">Stock Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {products.map((product) => {
              const image = getImageUrl(product);
              return (
                <tr className="align-top transition hover:bg-mint/35" key={product._id}>
                  <td className="px-4 py-3 font-black text-forest">{product.productCode}</td>
                  <td className="px-4 py-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-mint">
                      {image ? (
                        <img alt="" className="h-full w-full object-contain p-1" src={image} />
                      ) : (
                        <span className="text-xs font-black text-forest">KN</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-ink">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.category?.name || "Not Set"}</td>
                  <td className="px-4 py-3 text-muted">{product.brand || "Not Set"}</td>
                  <td className="px-4 py-3 text-muted">{getProductUnitLabel(product.unit)}</td>
                  <td className="px-4 py-3 font-bold text-ink">{formatProductPrice(product.sellingPrice)}</td>
                  <td className="px-4 py-3 text-muted">{product.minimumStock ?? 0}</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StockStatusBadge
                      availableStock={product.stock?.availableStock}
                      minimumStock={product.stock?.minimumStock ?? product.minimumStock}
                      status={product.stock?.stockStatus}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        aria-label={`View ${product.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                        to={`${ROUTES.SUPER_ADMIN.PRODUCTS}/${product._id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {canUpdate ? (
                        <Link
                          aria-label={`Edit ${product.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                          to={`${ROUTES.SUPER_ADMIN.PRODUCTS}/${product._id}/edit`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      ) : null}
                      {canManage ? (
                        <button
                          aria-label={`Change status for ${product.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                          onClick={() => onStatusAction?.(product)}
                          type="button"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
