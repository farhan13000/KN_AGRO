import { EMPLOYEE_STATUS } from "../constants";
import { formatEmployeeStatus } from "../utils";

const statusClasses = {
  [EMPLOYEE_STATUS.PENDING_APPROVAL]: "bg-amber-50 text-amber-900 ring-amber-200",
  [EMPLOYEE_STATUS.ACTIVE]: "bg-green-50 text-green-800 ring-green-200",
  [EMPLOYEE_STATUS.INACTIVE]: "bg-slate-50 text-slate-700 ring-slate-200",
  [EMPLOYEE_STATUS.RESIGNED]: "bg-blue-50 text-blue-800 ring-blue-200",
  [EMPLOYEE_STATUS.TERMINATED]: "bg-red-50 text-red-800 ring-red-200",
  [EMPLOYEE_STATUS.REJECTED]: "bg-rose-50 text-rose-800 ring-rose-200",
};

export default function EmployeeStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {formatEmployeeStatus(status)}
    </span>
  );
}
