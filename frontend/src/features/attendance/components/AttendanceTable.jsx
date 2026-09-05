import { formatBusinessDateTime } from "../../../shared/utils";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

const employeeName = (employee) => employee?.user?.name || employee?.employeeCode || "Unknown";

export default function AttendanceTable({ onCorrect, records, showEmployee = false }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-forest/10 bg-white shadow-sm">
      <table className="w-full min-w-[720px] divide-y divide-forest/10 text-left text-sm">
        <thead className="text-xs font-black uppercase text-forest">
          <tr>
            {showEmployee ? <th className="px-4 py-3">Employee</th> : null}
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Check-In</th>
            <th className="px-4 py-3">Check-Out</th>
            <th className="px-4 py-3">Working Minutes</th>
            <th className="px-4 py-3">Status</th>
            {onCorrect ? <th className="px-4 py-3" /> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-forest/10">
          {records.map((record) => (
            <tr key={record._id}>
              {showEmployee ? (
                <td className="px-4 py-3 font-semibold text-ink">{employeeName(record.employee)}</td>
              ) : null}
              <td className="whitespace-nowrap px-4 py-3 text-muted">{formatBusinessDateTime(record.date)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {record.checkIn ? formatBusinessDateTime(record.checkIn) : "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {record.checkOut ? formatBusinessDateTime(record.checkOut) : "—"}
              </td>
              <td className="px-4 py-3 text-muted">{record.workingMinutes ?? 0}</td>
              <td className="px-4 py-3">
                <AttendanceStatusBadge status={record.status} />
              </td>
              {onCorrect ? (
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    className="text-xs font-bold text-forest underline-offset-2 hover:underline"
                    onClick={() => onCorrect(record)}
                    type="button"
                  >
                    Correct
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
