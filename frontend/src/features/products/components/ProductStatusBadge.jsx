import { PRODUCT_STATUS } from "../constants";
import { getProductStatusLabel } from "../utils";

const statusClasses = {
  [PRODUCT_STATUS.ACTIVE]: "bg-green-50 text-green-800 ring-green-200",
  [PRODUCT_STATUS.INACTIVE]: "bg-slate-50 text-slate-700 ring-slate-200",
  [PRODUCT_STATUS.DISCONTINUED]: "bg-red-50 text-red-800 ring-red-200",
};

export default function ProductStatusBadge({ status }) {
  const label = getProductStatusLabel(status);

  return (
    <span
      aria-label={`Product status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
