import { HIRING_STATUS, HIRING_STATUS_LABELS } from "../constants";

const statusClasses = {
  [HIRING_STATUS.REQUESTED]: "bg-slate-50 text-slate-700 ring-slate-200",
  [HIRING_STATUS.PROCESSING]: "bg-amber-50 text-amber-900 ring-amber-200",
  [HIRING_STATUS.UNDER_REVIEW]: "bg-amber-50 text-amber-900 ring-amber-200",
  [HIRING_STATUS.APPROVED]: "bg-green-50 text-green-800 ring-green-200",
  [HIRING_STATUS.COMPLETED]: "bg-green-50 text-green-800 ring-green-200",
  [HIRING_STATUS.REJECTED]: "bg-red-50 text-red-800 ring-red-200",
};

export default function HiringStatusBadge({ status }) {
  const label = HIRING_STATUS_LABELS[status] || status || "Unknown";

  return (
    <span
      aria-label={`Hiring status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
