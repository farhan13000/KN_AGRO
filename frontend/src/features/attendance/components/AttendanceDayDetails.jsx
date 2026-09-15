import { formatBusinessDateTime } from "../../../shared/utils";
import { ATTENDANCE_STATUS_LABELS } from "../constants";
import { HALF_DAY_REASON_LABELS } from "../utils/attendancePolicy";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

function Photo({ alt, photo }) {
  if (!photo?.url) {
    return <div className="flex h-28 items-center justify-center rounded-lg bg-mint/40 text-xs text-muted">No photo</div>;
  }
  return (
    <a href={photo.url} rel="noreferrer" target="_blank">
      <img alt={alt} className="h-28 w-full rounded-lg object-cover ring-1 ring-forest/15" src={photo.url} />
    </a>
  );
}

/**
 * Where the mark was made: a small map and a link that opens Google Maps
 * at that point. The embed needs no API key.
 */
function LocationView({ label, location }) {
  if (!location) {
    return <p className="text-xs text-muted">Location: —</p>;
  }
  const point = `${location.latitude},${location.longitude}`;
  return (
    <div className="space-y-1">
      <iframe
        className="h-36 w-full rounded-lg border-0 ring-1 ring-forest/15"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://maps.google.com/maps?q=${point}&z=16&output=embed`}
        title={`${label} location`}
      />
      <p className="text-xs text-muted">
        <a
          className="font-bold text-forest underline"
          href={`https://www.google.com/maps/search/?api=1&query=${point}`}
          rel="noreferrer"
          target="_blank"
        >
          Open in Google Maps
        </a>
        {" · "}
        {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        {typeof location.accuracy === "number" ? ` · ±${Math.round(location.accuracy)} m` : ""}
      </p>
    </div>
  );
}

function Side({ label, location, meterPhoto, reading, selfie, time }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-black uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm text-ink">{time ? formatBusinessDateTime(time) : "Not marked"}</p>
      <div className="grid grid-cols-2 gap-2">
        <Photo alt={`${label} selfie`} photo={selfie} />
        <Photo alt={`${label} meter`} photo={meterPhoto} />
      </div>
      <p className="text-xs text-muted">
        Meter: <span className="font-bold text-ink">{typeof reading === "number" ? `${reading} km` : "—"}</span>
      </p>
      {time ? <LocationView label={label} location={location} /> : null}
    </div>
  );
}

/**
 * Everything about one day, for both the employee's own calendar and a
 * manager's view of a team member: times, both photos on each side, the
 * meter readings and the distance they imply, why a half day is a half
 * day, and where any review request stands.
 *
 * `actions` is rendered at the bottom so each caller decides what can be
 * done (ask for review, decide a review, correct) without this component
 * knowing who is looking.
 */
export default function AttendanceDayDetails({ actions = null, record }) {
  if (!record) return null;
  // The reasons stay stored after a manager turns the day into a full day
  // (they are the history), so they only read as "half day" while it is one.
  const reasons = record.status === "HALF_DAY" ? record.halfDayReasons || [] : [];
  const review = record.review;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <AttendanceStatusBadge status={record.status} />
        {record.lateCheckIn ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">Late check-in</span>
        ) : null}
        {record.lateCheckOut ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">Late check-out</span>
        ) : null}
      </div>

      {reasons.length ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Half day: {reasons.map((reason) => HALF_DAY_REASON_LABELS[reason] || reason).join(", ")}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Side
          label="Check-in"
          location={record.checkInLocation}
          meterPhoto={record.checkInMeterPhoto}
          reading={record.checkInMeterReading}
          selfie={record.checkInSelfie}
          time={record.checkIn}
        />
        <Side
          label="Check-out"
          location={record.checkOutLocation}
          meterPhoto={record.checkOutMeterPhoto}
          reading={record.checkOutMeterReading}
          selfie={record.checkOutSelfie}
          time={record.checkOut}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted">
        {typeof record.distanceKm === "number" ? (
          <span>
            Distance: <span className="font-bold text-ink">{record.distanceKm} km</span>
          </span>
        ) : null}
        {record.workingMinutes ? (
          <span>
            Worked:{" "}
            <span className="font-bold text-ink">
              {Math.floor(record.workingMinutes / 60)}h {record.workingMinutes % 60}m
            </span>
          </span>
        ) : null}
      </div>

      {review ? (
        <div className="rounded-lg border border-forest/10 bg-mint/30 p-3 text-sm">
          <p className="font-black text-ink">
            {review.status === "PENDING" ? "Waiting for the manager's review" : "Manager's review"}
          </p>
          <p className="mt-1 whitespace-pre-line text-muted">“{review.message}”</p>
          {review.status === "RESOLVED" ? (
            <p className="mt-2 text-ink">
              Decision:{" "}
              <span className="font-bold">{ATTENDANCE_STATUS_LABELS[review.decision] || review.decision}</span>
              {review.resolutionNote ? ` — ${review.resolutionNote}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      {record.remarks ? <p className="text-sm text-ink">{record.remarks}</p> : null}

      {actions ? <div className="flex flex-wrap justify-end gap-3">{actions}</div> : null}
    </div>
  );
}
