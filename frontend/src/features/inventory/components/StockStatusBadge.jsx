import { STOCK_STATUS } from "../constants";
import { deriveStockStatus, getStockStatusLabel } from "../utils";

const statusClasses = {
  [STOCK_STATUS.IN_STOCK]: "bg-green-50 text-green-800 ring-green-200",
  [STOCK_STATUS.LOW_STOCK]: "bg-amber-50 text-amber-900 ring-amber-200",
  [STOCK_STATUS.OUT_OF_STOCK]: "bg-red-50 text-red-800 ring-red-200",
};

export default function StockStatusBadge({ availableStock, minimumStock, status }) {
  const resolvedStatus = status || deriveStockStatus({ availableStock, minimumStock });
  const label = getStockStatusLabel(resolvedStatus);

  return (
    <span
      aria-label={`Stock status: ${label}`}
      className={`inline-flex min-h-7 items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[resolvedStatus] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
