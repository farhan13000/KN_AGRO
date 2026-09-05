import { LEAVE_STATUS, LEAVE_TYPE_LABELS } from "../constants";
import LeaveStatusBadge from "./LeaveStatusBadge";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString();
};

const employeeName = (employee) => employee?.user?.name || employee?.employeeCode || "Unknown";

export default function LeaveCard({ actions = null, leave, showEmployee = false }) {
  return (
    <li className="rounded-lg border border-forest/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {showEmployee ? <p className="text-sm font-black text-ink">{employeeName(leave.employee)}</p> : null}
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="font-semibold text-ink">{LEAVE_TYPE_LABELS[leave.leaveType] || leave.leaveType}</span>
            <span>
              {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
            </span>
            <span>({leave.totalDays} day{leave.totalDays === 1 ? "" : "s"})</span>
          </p>
        </div>
        <LeaveStatusBadge status={leave.status} />
      </div>

      <p className="mt-3 text-sm text-muted">
        <span className="text-xs font-black uppercase tracking-wide text-muted">Reason</span> {leave.reason}
      </p>

      {leave.managerComment ? (
        <p className="mt-2 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Manager Comment</span>{" "}
          {leave.managerComment}
        </p>
      ) : null}

      {leave.status === LEAVE_STATUS.CANCELLED && leave.cancellationReason ? (
        <p className="mt-2 text-sm text-muted">
          <span className="text-xs font-black uppercase tracking-wide text-muted">Cancellation Reason</span>{" "}
          {leave.cancellationReason}
        </p>
      ) : null}

      {actions ? <div className="mt-4 flex flex-wrap gap-3">{actions}</div> : null}
    </li>
  );
}
