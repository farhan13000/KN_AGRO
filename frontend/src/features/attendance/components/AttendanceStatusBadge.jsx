import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from "../constants";

const statusClasses = {
  [ATTENDANCE_STATUS.PRESENT]: "bg-green-50 text-green-800 ring-green-200",
  [ATTENDANCE_STATUS.HALF_DAY]: "bg-amber-50 text-amber-900 ring-amber-200",
  [ATTENDANCE_STATUS.ABSENT]: "bg-red-50 text-red-800 ring-red-200",
  [ATTENDANCE_STATUS.LEAVE]: "bg-blue-50 text-blue-800 ring-blue-200",
  [ATTENDANCE_STATUS.HOLIDAY]: "bg-mint text-forest ring-forest/15",
  [ATTENDANCE_STATUS.WEEK_OFF]: "bg-zinc-50 text-zinc-700 ring-zinc-200",
};

export default function AttendanceStatusBadge({ status }) {
  if (!status) {
    return (
      <span className="inline-flex min-h-7 items-center rounded-full bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-500 ring-1 ring-zinc-200">
        Not Marked
      </span>
    );
  }

  const label = ATTENDANCE_STATUS_LABELS[status] || status;

  return (
    <span
      aria-label={`Attendance status: ${label}`}
      className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        statusClasses[status] || "bg-zinc-50 text-zinc-700 ring-zinc-200"
      }`}
    >
      {label}
    </span>
  );
}
