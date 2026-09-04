import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { formatBusinessDateTime, formatMoney } from "../../../shared/utils";
import { useEmployeeDashboard } from "../hooks";
import { KeyValueRow, Section, Stat, StatGrid } from "./DashboardPrimitives";

/**
 * FO (and legacy EMPLOYEE) dashboard — GET /analytics/employee/dashboard,
 * every field rendered directly from the backend's own Employee Dashboard
 * Contract (dashboard.service.js), nothing computed client-side. Matches
 * the migration plan's Section 32 FO list: own leads, follow-ups, orders,
 * sales, attendance, DSR, performance.
 */
export default function EmployeeDashboardContent() {
  const state = useEmployeeDashboard();

  if (state.isLoading) return <PageLoader message="Loading your dashboard..." />;
  if (state.isError) return <ErrorState message={state.errorMessage} title="Unable to load your dashboard" />;

  const d = state.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <StatGrid>
        <Stat label="Assigned Leads" value={d.leads?.assigned} />
        <Stat label="Follow-Ups Today" value={d.leads?.followUpsToday} />
        <Stat label="Orders" value={d.sales?.orders} />
        <Stat label="Order Value" money value={d.sales?.orderValue} />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Attendance">
          <div className="space-y-2">
            <KeyValueRow label="Today" value={d.attendanceToday?.todayStatus || "Not marked"} />
            <KeyValueRow
              label="Check-In"
              value={d.attendanceToday?.checkIn ? formatBusinessDateTime(d.attendanceToday.checkIn) : "Not yet"}
            />
            <KeyValueRow
              label="Check-Out"
              value={d.attendanceToday?.checkOut ? formatBusinessDateTime(d.attendanceToday.checkOut) : "Not yet"}
            />
            <KeyValueRow label="Present Days (Month)" value={d.attendanceMonth?.presentDays ?? 0} />
            <KeyValueRow label="Half Days (Month)" value={d.attendanceMonth?.halfDays ?? 0} />
            <KeyValueRow label="Leave Days (Month)" value={d.attendanceMonth?.leaveDays ?? 0} />
          </div>
        </Section>

        <Section title="Daily Sales Reports">
          <div className="space-y-2">
            <KeyValueRow label="Submitted Today" value={d.dsr?.submittedToday ? "Yes" : "No"} />
            <KeyValueRow label="Submitted This Month" value={d.dsr?.submittedThisMonth ?? 0} />
            <KeyValueRow label="Pending Review" value={d.dsr?.pendingReview ?? 0} />
            <KeyValueRow label="Pending Acknowledgement" value={d.dsr?.pendingAcknowledgement ?? 0} />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Leads &amp; Performance">
          <div className="space-y-2">
            <KeyValueRow label="Overdue Follow-Ups" value={d.leads?.overdue ?? 0} />
            <KeyValueRow label="Converted Leads" value={d.leads?.converted ?? 0} />
          </div>
        </Section>

        <Section title="Leaves &amp; Reports">
          <div className="space-y-2">
            <KeyValueRow label="Pending Leave Requests" value={d.leaves?.pending ?? 0} />
            <KeyValueRow label="Upcoming Approved Leaves" value={d.leaves?.upcoming?.length ?? 0} />
            <KeyValueRow label="Pending Reports" value={d.reports?.pending ?? 0} />
            <KeyValueRow label="Overdue Reports" value={d.reports?.overdue ?? 0} />
          </div>
        </Section>
      </div>

      {d.payroll ? (
        <Section title="Latest Payroll">
          {d.payroll.latest ? (
            <div className="space-y-2">
              <KeyValueRow label="Period" value={`${d.payroll.latest.month}/${d.payroll.latest.year}`} />
              <KeyValueRow label="Net Salary" value={formatMoney(d.payroll.latest.netSalary)} />
              <KeyValueRow label="Status" value={d.payroll.latest.status} />
            </div>
          ) : (
            <p className="text-sm text-muted">No payroll processed yet.</p>
          )}
        </Section>
      ) : null}
    </div>
  );
}
