import { DSR_STATUS, DSR_STATUS_LABELS } from "../constants";

const statusClasses = {
  [DSR_STATUS.SUBMITTED]: "bg-amber-50 text-amber-900 ring-amber-200",
  [DSR_STATUS.REVIEWED]: "bg-blue-50 text-blue-800 ring-blue-200",
  [DSR_STATUS.ACKNOWLEDGED]: "bg-green-50 text-green-800 ring-green-200",
};

export default function DSRStatusBadge({ status }) {
  const label = DSR_STATUS_LABELS[status] || status || "Unknown";

  return (
    <span
      aria-label={`DSR status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
