import { PAYROLL_STATUS, PAYROLL_STATUS_LABELS } from "../constants";

const statusClasses = {
  [PAYROLL_STATUS.DRAFT]: "bg-slate-50 text-slate-700 ring-slate-200",
  [PAYROLL_STATUS.PROCESSED]: "bg-amber-50 text-amber-900 ring-amber-200",
  [PAYROLL_STATUS.PAID]: "bg-green-50 text-green-800 ring-green-200",
  [PAYROLL_STATUS.CANCELLED]: "bg-red-50 text-red-800 ring-red-200",
};

export default function PayrollStatusBadge({ status }) {
  const label = PAYROLL_STATUS_LABELS[status] || status || "Unknown";

  return (
    <span
      aria-label={`Payroll status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
