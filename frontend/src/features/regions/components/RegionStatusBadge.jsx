import { REGION_STATUS, REGION_STATUS_LABELS } from "../constants";

const statusClasses = {
  [REGION_STATUS.ACTIVE]: "bg-green-50 text-green-800 ring-green-200",
  [REGION_STATUS.INACTIVE]: "bg-slate-50 text-slate-700 ring-slate-200",
};

export default function RegionStatusBadge({ status }) {
  const label = REGION_STATUS_LABELS[status] || status || "Unknown";

  return (
    <span
      aria-label={`Region status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
