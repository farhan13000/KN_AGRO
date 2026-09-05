import { REPORT_STATUS, REPORT_STATUS_LABELS } from "../constants";

const statusClasses = {
  [REPORT_STATUS.PENDING]: "bg-amber-50 text-amber-900 ring-amber-200",
  [REPORT_STATUS.IN_PROGRESS]: "bg-blue-50 text-blue-800 ring-blue-200",
  [REPORT_STATUS.SUBMITTED]: "bg-mint text-forest ring-forest/15",
  [REPORT_STATUS.REVIEWED]: "bg-green-50 text-green-800 ring-green-200",
  [REPORT_STATUS.REJECTED]: "bg-red-50 text-red-800 ring-red-200",
  [REPORT_STATUS.CANCELLED]: "bg-zinc-50 text-zinc-700 ring-zinc-200",
};

export default function ReportRequestStatusBadge({ status }) {
  const label = REPORT_STATUS_LABELS[status] || status || "Unknown";

  return (
    <span
      aria-label={`Report request status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
