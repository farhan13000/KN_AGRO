import { MapPin } from "lucide-react";
import { formatBusinessDateTime } from "../../../shared/utils";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

const employeeName = (employee) => employee?.user?.name || employee?.employeeCode || "Unknown";
const dayOnly = (value) => (value ? formatBusinessDateTime(value).split(",")[0] : "—");
const timeOnly = (value) => (value ? formatBusinessDateTime(value).split(",").slice(1).join(",").trim() : "—");
const reading = (value) => (typeof value === "number" ? value : "—");

function Thumb({ alt, photo }) {
  if (!photo?.url) return <span className="inline-block h-9 w-9 rounded bg-mint/40" title="No photo" />;
  return (
    <a href={photo.url} rel="noreferrer" target="_blank">
      <img alt={alt} className="h-9 w-9 rounded object-cover ring-1 ring-forest/15" src={photo.url} />
    </a>
  );
}

function Pin({ label, location }) {
  if (!location) return <span className="text-muted">{label} —</span>;
  return (
    <a
      className="inline-flex items-center gap-1 font-bold text-forest hover:underline"
      href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
      rel="noreferrer"
      target="_blank"
      title={`${location.latitude}, ${location.longitude}`}
    >
      <MapPin className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

/**
 * Attendance rows with what was captured at each mark: selfies, meter
 * readings (and the distance between them), and a map link per location.
 * `onView` opens the full record; `onCorrect` edits it directly. Either is
 * omitted where the viewer may not do that.
 */
export default function AttendanceTable({ onCorrect, onView, records, showEmployee = false }) {
  const hasActions = Boolean(onView || onCorrect);

  return (
    <div className="overflow-x-auto rounded-lg border border-forest/10 bg-white shadow-sm">
      <table className="w-full min-w-[1000px] divide-y divide-forest/10 text-left text-sm">
        <thead className="text-xs font-black uppercase text-forest">
          <tr>
            {showEmployee ? <th className="px-4 py-3">Employee</th> : null}
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Check-In</th>
            <th className="px-4 py-3">Check-Out</th>
            <th className="px-4 py-3">Selfies</th>
            <th className="px-4 py-3">Meter (km)</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
            {hasActions ? <th className="px-4 py-3" /> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-forest/10">
          {records.map((record) => (
            <tr key={record._id}>
              {showEmployee ? (
                <td className="px-4 py-3 font-semibold text-ink">{employeeName(record.employee)}</td>
              ) : null}
              <td className="whitespace-nowrap px-4 py-3 text-muted">{dayOnly(record.date)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">{timeOnly(record.checkIn)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">{timeOnly(record.checkOut)}</td>
              <td className="px-4 py-3">
                <span className="flex gap-1">
                  <Thumb alt="Check-in selfie" photo={record.checkInSelfie} />
                  <Thumb alt="Check-out selfie" photo={record.checkOutSelfie} />
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {reading(record.checkInMeterReading)} → {reading(record.checkOutMeterReading)}
                {typeof record.distanceKm === "number" ? (
                  <span className="block text-xs font-bold text-ink">{record.distanceKm} km</span>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs">
                <span className="flex flex-col gap-1">
                  <Pin label="In" location={record.checkInLocation} />
                  <Pin label="Out" location={record.checkOutLocation} />
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="flex flex-col items-start gap-1">
                  <AttendanceStatusBadge status={record.status} />
                  {record.review?.status === "PENDING" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                      Review pending
                    </span>
                  ) : null}
                </span>
              </td>
              {hasActions ? (
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="flex gap-3">
                    {onView ? (
                      <button
                        className="text-xs font-bold text-forest underline-offset-2 hover:underline"
                        onClick={() => onView(record)}
                        type="button"
                      >
                        View
                      </button>
                    ) : null}
                    {onCorrect ? (
                      <button
                        className="text-xs font-bold text-forest underline-offset-2 hover:underline"
                        onClick={() => onCorrect(record)}
                        type="button"
                      >
                        Edit
                      </button>
                    ) : null}
                  </span>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
