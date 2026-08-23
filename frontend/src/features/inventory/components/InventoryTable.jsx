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

export default function InventoryTable({ items = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Product Code</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Current</th>
              <th className="px-4 py-3">Reserved</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3">Minimum</th>
              <th className="px-4 py-3">Stock Status</th>
              <th className="px-4 py-3">Last Movement</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {items.map((item) => (
              <tr className="align-top transition hover:bg-mint/35" key={item._id || item.product?._id}>
                <td className="px-4 py-3 font-black text-forest">{item.productCode}</td>
                <td className="px-4 py-3 font-black text-ink">{item.product?.name || "Not Available"}</td>
                <td className="px-4 py-3 text-muted">{item.category?.name || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{getProductUnitLabel(item.unit)}</td>
                <td className="px-4 py-3 text-muted">{item.currentStock ?? 0}</td>
                <td className="px-4 py-3 text-muted">{item.reservedStock ?? 0}</td>
                <td className="px-4 py-3 font-bold text-ink">{item.availableStock ?? 0}</td>
                <td className="px-4 py-3 text-muted">{item.minimumStock ?? 0}</td>
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
                    <Link
                      aria-label={`View inventory for ${item.product?.name || item.productCode}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={`${ROUTES.SUPER_ADMIN.INVENTORY}/${item.product?._id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
