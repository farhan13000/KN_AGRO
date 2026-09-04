import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { formatBusinessDateTime } from "../../../shared/utils";
import { useSalesOfficerDashboard } from "../hooks";
import { KeyValueRow, Section, Stat, StatGrid } from "./DashboardPrimitives";

/**
 * SO dashboard — GET /analytics/so/dashboard, a lighter, mostly-self tier
 * the backend built specifically because SO is manager-tier for
 * data-scope purposes but doesn't fit the full GM/RM/ASM Manager
 * Dashboard shape (see dashboard.service.js#getSalesOfficerDashboard's
 * own comment). Matches the migration plan's Section 32 SO list: own
 * sales, FO-team sales, FO leads, attendance, DSR, team performance.
 */
export default function SalesOfficerDashboardContent() {
  const state = useSalesOfficerDashboard();

  if (state.isLoading) return <PageLoader message="Loading your dashboard..." />;
  if (state.isError) return <ErrorState message={state.errorMessage} title="Unable to load your dashboard" />;

  const d = state.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="My Own Sales">
          <StatGrid>
            <Stat label="My Leads" value={d.own?.leads} />
            <Stat label="My Orders" value={d.own?.orders} />
            <Stat label="My Sales Value" money value={d.own?.salesValue} />
          </StatGrid>
        </Section>

        <Section title={`My FO Team (${d.team?.size ?? 0})`}>
          <StatGrid>
            <Stat label="Team Leads" value={d.team?.leads} />
            <Stat label="Team Orders" value={d.team?.orders} />
            <Stat label="Team Sales Value" money value={d.team?.salesValue} />
          </StatGrid>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Attendance Today">
          <div className="space-y-2">
            <KeyValueRow label="Status" value={d.attendanceToday?.status || "Not marked"} />
            <KeyValueRow
              label="Check-In"
              value={d.attendanceToday?.checkIn ? formatBusinessDateTime(d.attendanceToday.checkIn) : "Not yet"}
            />
            <KeyValueRow
              label="Check-Out"
              value={d.attendanceToday?.checkOut ? formatBusinessDateTime(d.attendanceToday.checkOut) : "Not yet"}
            />
          </div>
        </Section>

        <Section title="Team Performance">
          <div className="space-y-2">
            <KeyValueRow label="Present Today" value={d.team?.performance?.presentToday ?? 0} />
            <KeyValueRow label="Checked Out Today" value={d.team?.performance?.checkedOutToday ?? 0} />
            <KeyValueRow label="Not Checked In" value={d.team?.performance?.notCheckedIn ?? 0} />
            <KeyValueRow label="Pending Leave Requests" value={d.team?.performance?.pendingLeaveRequests ?? 0} />
            <KeyValueRow label="Overdue Reports" value={d.team?.performance?.overdueReports ?? 0} />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="My DSRs">
          <div className="space-y-2">
            <KeyValueRow label="Submitted Today" value={d.dsr?.submittedToday ? "Yes" : "No"} />
            <KeyValueRow label="Submitted This Month" value={d.dsr?.submittedThisMonth ?? 0} />
            <KeyValueRow label="Pending Review" value={d.dsr?.pendingReview ?? 0} />
          </div>
        </Section>

        <Section title="Team DSRs">
          <div className="space-y-2">
            <KeyValueRow label="Submitted Today" value={d.teamDsr?.submittedToday ?? 0} />
            <KeyValueRow label="Pending Review" value={d.teamDsr?.pendingReview ?? 0} />
            <KeyValueRow label="Pending Acknowledgement" value={d.teamDsr?.pendingAcknowledgement ?? 0} />
          </div>
        </Section>
      </div>
    </div>
  );
}
