import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../../shared/components/Card";
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from "../constants";

/**
 * A month at a glance: which days were worked, missed, half, on leave.
 *
 * A table of rows answers "what happened on the 14th?"; only a calendar
 * answers "how was last month?", which is the question a person and their
 * manager actually ask. Both still exist — this sits above the list, it
 * does not replace it.
 *
 * Records are matched to cells by their LOCAL calendar date. Attendance
 * `date` is a business-day marker (UTC midnight of the workday in the
 * business timezone), so the day component is read in UTC; reading it
 * locally would shift every cell by one day for anyone west of UTC.
 */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLE = {
  [ATTENDANCE_STATUS.PRESENT]: "bg-forest text-white",
  [ATTENDANCE_STATUS.HALF_DAY]: "bg-amber-400 text-ink",
  [ATTENDANCE_STATUS.ABSENT]: "bg-red-500 text-white",
  [ATTENDANCE_STATUS.LEAVE]: "bg-sky-500 text-white",
  [ATTENDANCE_STATUS.HOLIDAY]: "bg-violet-400 text-white",
  [ATTENDANCE_STATUS.WEEK_OFF]: "bg-forest/15 text-forest",
};

const isoDayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const monthLabel = (year, month) =>
  new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/**
 * Days laid out Monday-first, with leading blanks so the 1st lands under
 * the right weekday. `Date.UTC` throughout, for the same reason the keys
 * above are read in UTC.
 */
const buildGrid = (year, month) => {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // getUTCDay() is Sunday-first (0); shift it so Monday is 0.
  const leading = (first.getUTCDay() + 6) % 7;

  const cells = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, month - 1, day));
    cells.push({ day, key: date.toISOString().slice(0, 10) });
  }
  return cells;
};

export default function AttendanceCalendar({
  emptyHint = "No attendance was recorded this month.",
  month,
  onMonthChange,
  onSelectDay,
  records = [],
  title = "Attendance Calendar",
  year,
}) {
  const [internal, setInternal] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  // Controlled when a month/year is passed in, uncontrolled otherwise, so
  // the same calendar works standalone and inside a page that already
  // owns the period it is showing.
  const activeMonth = month ?? internal.month;
  const activeYear = year ?? internal.year;

  const setPeriod = (nextMonth, nextYear) => {
    if (onMonthChange) onMonthChange(nextMonth, nextYear);
    else setInternal({ month: nextMonth, year: nextYear });
  };

  const step = (delta) => {
    const zeroBased = activeMonth - 1 + delta;
    const nextYear = activeYear + Math.floor(zeroBased / 12);
    const nextMonth = ((zeroBased % 12) + 12) % 12 + 1;
    setPeriod(nextMonth, nextYear);
  };

  const byDay = useMemo(() => {
    const map = new Map();
    records.forEach((record) => {
      const key = isoDayKey(record.date);
      if (key) map.set(key, record);
    });
    return map;
  }, [records]);

  const cells = useMemo(() => buildGrid(activeYear, activeMonth), [activeYear, activeMonth]);
  const todayKey = isoDayKey(new Date());
  const marked = cells.filter((cell) => cell && byDay.has(cell.key)).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={() => step(-1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-40 text-center text-sm font-black text-ink">
            {monthLabel(activeYear, activeMonth)}
          </span>
          <button
            aria-label="Next month"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
            onClick={() => step(1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((weekday) => (
          <span className="py-1 text-xs font-black uppercase tracking-wide text-muted" key={weekday}>
            {weekday}
          </span>
        ))}

        {cells.map((cell, index) => {
          if (!cell) return <span key={`blank-${index}`} />;
          const record = byDay.get(cell.key);
          const style = record ? STATUS_STYLE[record.status] : "bg-white text-muted ring-1 ring-forest/10";
          const isToday = cell.key === todayKey;
          const label = record
            ? `${cell.day}: ${ATTENDANCE_STATUS_LABELS[record.status] || record.status}`
            : `${cell.day}: not marked`;

          return (
            <button
              aria-label={label}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-bold transition ${style} ${
                isToday ? "ring-2 ring-agriculture ring-offset-1" : ""
              } ${record && onSelectDay ? "hover:opacity-80" : ""} ${
                record ? "" : "cursor-default"
              }`}
              disabled={!record || !onSelectDay}
              key={cell.key}
              onClick={() => record && onSelectDay?.(record)}
              title={label}
              type="button"
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {Object.values(ATTENDANCE_STATUS).map((status) => (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-muted" key={status}>
            <span className={`inline-block h-3 w-3 rounded ${STATUS_STYLE[status]}`} />
            {ATTENDANCE_STATUS_LABELS[status] || status}
          </span>
        ))}
      </div>

      {!marked ? <p className="mt-3 text-sm text-muted">{emptyHint}</p> : null}
    </Card>
  );
}
