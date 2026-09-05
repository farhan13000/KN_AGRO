import { LEAVE_STATUS, LEAVE_STATUS_LABELS } from "../constants";

const statusClasses = {
  [LEAVE_STATUS.PENDING]: "bg-amber-50 text-amber-900 ring-amber-200",
  [LEAVE_STATUS.APPROVED]: "bg-green-50 text-green-800 ring-green-200",
  [LEAVE_STATUS.REJECTED]: "bg-red-50 text-red-800 ring-red-200",
  [LEAVE_STATUS.CANCELLED]: "bg-zinc-50 text-zinc-700 ring-zinc-200",
};

export default function LeaveStatusBadge({ status }) {
  const label = LEAVE_STATUS_LABELS[status] || status || "Unknown";

  return (
    <span
      aria-label={`Leave status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
