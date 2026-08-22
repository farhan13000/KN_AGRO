import { formatUserStatus } from "../utils";

const accountStatusClasses = {
  ACTIVE: "bg-green-50 text-green-800 ring-green-200",
  PENDING: "bg-amber-50 text-amber-900 ring-amber-200",
  SUSPENDED: "bg-orange-50 text-orange-800 ring-orange-200",
  DISABLED: "bg-red-50 text-red-800 ring-red-200",
};

export default function UserAccountStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        accountStatusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {formatUserStatus(status)}
    </span>
  );
}
