import { useEmployeePerformance } from "../../analytics/hooks";
import Card from "../../../shared/components/Card";
import { formatMoney } from "../../../shared/utils";

const Stat = ({ label, value }) => (
  <div>
    <dt className="text-xs font-black uppercase tracking-wide text-forest">{label}</dt>
    <dd className="mt-1 text-lg font-black tabular-nums text-ink">{value}</dd>
  </div>
);

/**
 * This employee's own row from the company-wide performance report.
 *
 * The backend has no per-employee performance endpoint — it returns every
 * active employee in one call — so this picks its row out client-side.
 * That is fine here precisely because the endpoint is admin-only: the
 * viewer is already entitled to the whole report, so nothing is being
 * filtered for privacy that the server didn't already decide.
 *
 * Mount only where the viewer holds ANALYTICS_ADMIN; anyone else gets a
 * 403 from the endpoint. The caller checks, not this component.
 */
export default function EmployeePerformanceCard({ employeeId }) {
  const state = useEmployeePerformance();

  const rows = state.data?.employees || state.data || [];
  const row = Array.isArray(rows)
    ? rows.find((entry) => String(entry.employee?._id) === String(employeeId))
    : null;

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Performance</h2>
      <p className="mt-1 text-xs font-semibold text-muted">
        Leads and sales to date; attendance and reports for the current month.
      </p>

      {state.isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading...</p> : null}

      {state.isError ? (
        <p className="mt-4 text-sm text-muted">Performance figures are not available for this account.</p>
      ) : null}

      {!state.isLoading && !state.isError && !row ? (
        <p className="mt-4 text-sm text-muted">
          No performance has been recorded for this employee yet.
        </p>
      ) : null}

      {row ? (
        <dl className="mt-5 grid gap-5 sm:grid-cols-3">
          <Stat label="Leads" value={row.leads ?? 0} />
          <Stat label="Conversion" value={`${Math.round((row.conversionRate ?? 0) * 100) / 100}%`} />
          <Stat label="Orders" value={row.orders ?? 0} />
          <Stat label="Booked Value" value={formatMoney(row.bookedOrderValue ?? 0)} />
          <Stat label="Attendance (month)" value={row.attendanceRecorded ?? 0} />
          <Stat label="Reports" value={row.reportsSubmitted ?? row.reports ?? 0} />
        </dl>
      ) : null}
    </Card>
  );
}
