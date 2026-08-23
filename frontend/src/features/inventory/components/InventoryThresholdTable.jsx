import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
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

export default function InventoryThresholdTable({ items = [], mode = "low" }) {
  const isOutOfStock = mode === "out";

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              {isOutOfStock ? <th className="px-4 py-3">Current Stock</th> : null}
              {isOutOfStock ? <th className="px-4 py-3">Reserved Stock</th> : null}
              <th className="px-4 py-3">Available Stock</th>
              <th className="px-4 py-3">Minimum Stock</th>
              {!isOutOfStock ? <th className="px-4 py-3">Difference</th> : null}
              <th className="px-4 py-3">Stock Status</th>
              <th className="px-4 py-3">Last Movement</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {items.map((item) => {
              const unit = getProductUnitLabel(item.unit || item.product?.unit);
              const productId = getProductId(item);
              const difference = Number(item.minimumStock || 0) - Number(item.availableStock || 0);

              return (
                <tr className="align-top transition hover:bg-mint/35" key={item._id || productId}>
                  <td className="px-4 py-3">
                    <p className="font-black text-ink">{item.product?.name || item.name || "Not Available"}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">{item.productCode || item.product?.productCode || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{item.category?.name || item.product?.category?.name || "Not Set"}</td>
                  {isOutOfStock ? (
                    <td className="px-4 py-3 text-muted">
                      {item.currentStock ?? 0} {unit}
                    </td>
                  ) : null}
                  {isOutOfStock ? (
                    <td className="px-4 py-3 text-muted">
                      {item.reservedStock ?? 0} {unit}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 font-bold text-ink">
                    {item.availableStock ?? 0} {unit}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {item.minimumStock ?? 0} {unit}
                  </td>
                  {!isOutOfStock ? (
                    <td className="px-4 py-3 font-bold text-ink">
                      {Math.max(difference, 0)} {unit}
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <StockStatusBadge
                      availableStock={item.availableStock}
                      minimumStock={item.minimumStock}
                      status={item.stockStatus}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(item.lastStockMovementAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {productId ? (
                        <Link
                          aria-label={`View inventory for ${item.product?.name || item.productCode}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                          to={`${ROUTES.SUPER_ADMIN.INVENTORY}/${productId}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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
