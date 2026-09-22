import { MapPin } from "lucide-react";
import { DataTable } from "../../../shared/components";
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
      className="inline-flex min-h-8 items-center gap-1 font-bold text-forest hover:underline"
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
  const columns = [
    showEmployee && {
      key: "employee",
      header: "Employee",
      role: "title",
      cellClassName: "font-semibold text-ink",
      cell: (record) => employeeName(record.employee),
    },
    {
      key: "date",
      header: "Date",
      // With no employee column this is what identifies the row, so on a
      // card it becomes the heading rather than one field among many.
      role: showEmployee ? undefined : "title",
      cellClassName: "whitespace-nowrap text-muted",
      cell: (record) => dayOnly(record.date),
    },
    {
      key: "checkIn",
      header: "Check-In",
      cellClassName: "whitespace-nowrap text-muted",
      cell: (record) => timeOnly(record.checkIn),
    },
    {
      key: "checkOut",
      header: "Check-Out",
      cellClassName: "whitespace-nowrap text-muted",
      cell: (record) => timeOnly(record.checkOut),
    },
    {
      key: "selfies",
      header: "Selfies",
      cell: (record) => (
        <span className="flex gap-1">
          <Thumb alt="Check-in selfie" photo={record.checkInSelfie} />
          <Thumb alt="Check-out selfie" photo={record.checkOutSelfie} />
        </span>
      ),
    },
    {
      key: "meter",
      header: "Meter (km)",
      cellClassName: "whitespace-nowrap text-muted",
      cell: (record) => (
        <>
          {reading(record.checkInMeterReading)} → {reading(record.checkOutMeterReading)}
          {typeof record.distanceKm === "number" ? (
            <span className="block text-xs font-bold text-ink">{record.distanceKm} km</span>
          ) : null}
        </>
      ),
    },
    {
      key: "location",
      header: "Location",
      cellClassName: "whitespace-nowrap text-xs",
      cell: (record) => (
        <span className="flex flex-col gap-1">
          <Pin label="In" location={record.checkInLocation} />
          <Pin label="Out" location={record.checkOutLocation} />
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: (record) => (
        <span className="flex flex-col items-end gap-1 md:items-start">
          <AttendanceStatusBadge status={record.status} />
          {record.review?.status === "PENDING" ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
              Review pending
            </span>
          ) : null}
        </span>
      ),
    },
    (onView || onCorrect) && {
      key: "actions",
      header: "Actions",
      role: "actions",
      cellClassName: "whitespace-nowrap",
      cell: (record) => (
        <span className="flex gap-3">
          {onView ? (
            <button
              className="inline-flex min-h-11 items-center text-xs font-bold text-forest underline-offset-2 hover:underline md:min-h-0"
              onClick={() => onView(record)}
              type="button"
            >
              View
            </button>
          ) : null}
          {onCorrect ? (
            <button
              className="inline-flex min-h-11 items-center text-xs font-bold text-forest underline-offset-2 hover:underline md:min-h-0"
              onClick={() => onCorrect(record)}
              type="button"
            >
              Edit
            </button>
          ) : null}
        </span>
      ),
    },
  ].filter(Boolean);

  return (
    <DataTable
      columns={columns}
      minWidth="1000px"
      rows={records}
      theadClassName="text-xs font-black uppercase text-forest"
    />
  );
}
