import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { formatMoney } from "../../../shared/utils";
import { useManagerDashboard } from "../hooks";
import { KeyValueRow, Section, Stat, StatGrid } from "./DashboardPrimitives";

const titleCase = (key) =>
  key
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

/**
 * GM/RM/ASM (and legacy SALES_MANAGER) dashboard — GET /analytics/manager/
 * dashboard. All four roles share this exact endpoint and response shape;
 * only the underlying numbers differ, scoped automatically to each
 * actor's own downline by the backend's resolveAnalyticsScope. This is
 * the SAME endpoint whichever of the four is logged in — there is no
 * separate GM-only or RM-only variant to call.
 *
 * Disclosed gap: the migration plan's own Section 32 wishlist for GM adds
 * "regions, districts, growth" on top of what SO/ASM/RM see — this single
 * shared endpoint does not break those out as distinct sections (no
 * region/district-level breakdown or trend/growth metric exists in its
 * contract). Not fabricated here; rendered exactly what the endpoint
 * actually returns.
 */
export default function ManagerDashboardContent() {
  const state = useManagerDashboard();

  if (state.isLoading) return <PageLoader message="Loading your dashboard..." />;
  if (state.isError) return <ErrorState message={state.errorMessage} title="Unable to load your dashboard" />;

  const d = state.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <StatGrid>
        <Stat label="Assigned Leads" value={d.kpis?.assignedLeads} />
        <Stat label="Converted Leads" value={d.kpis?.convertedLeads} />
        <Stat label="Conversion Rate" value={`${d.kpis?.conversionRate ?? 0}%`} />
        <Stat label="Pipeline Value" money value={d.kpis?.pipelineValue} />
        <Stat label="Booked Order Value" money value={d.kpis?.bookedOrderValue} />
        <Stat label="Invoiced Value" money value={d.kpis?.invoicedValue} />
        <Stat label="Outstanding" money value={d.kpis?.outstanding} />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Follow-Ups">
          <div className="space-y-2">
            <KeyValueRow label="Today" value={d.followUps?.today ?? 0} />
            <KeyValueRow label="Overdue" value={d.followUps?.overdue ?? 0} />
            <KeyValueRow label="Upcoming" value={d.followUps?.upcoming ?? 0} />
          </div>
        </Section>

        <Section title="Lead Funnel">
          <div className="space-y-2">
            {(d.leadFunnel?.funnel || []).map((row) => (
              <KeyValueRow key={row.status} label={titleCase(row.status)} value={row.count} />
            ))}
            <KeyValueRow label="Expected Pipeline Value" value={formatMoney(d.leadFunnel?.expectedPipelineValue)} />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Order Status">
          <div className="space-y-2">
            {(d.orderStatus || []).map((row) => (
              <KeyValueRow key={row.status} label={titleCase(row.status)} value={`${row.count} · ${formatMoney(row.value)}`} />
            ))}
          </div>
        </Section>

        <Section title="Team Attendance">
          <div className="space-y-2">
            <KeyValueRow label="Present Today" value={d.team?.attendance?.presentToday ?? 0} />
            <KeyValueRow label="Checked Out Today" value={d.team?.attendance?.checkedOutToday ?? 0} />
            <KeyValueRow label="Not Checked In" value={d.team?.attendance?.notCheckedIn ?? 0} />
            <KeyValueRow label="Pending Leaves" value={d.team?.pendingLeaves ?? 0} />
            <KeyValueRow label="Overdue Reports" value={d.team?.overdueReports ?? 0} />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Team DSRs">
          <div className="space-y-2">
            <KeyValueRow label="Team Size" value={d.dsr?.teamSize ?? 0} />
            <KeyValueRow label="Submitted Today" value={d.dsr?.submittedToday ?? 0} />
            <KeyValueRow label="Pending Review" value={d.dsr?.pendingReview ?? 0} />
            <KeyValueRow label="Pending Acknowledgement" value={d.dsr?.pendingAcknowledgement ?? 0} />
          </div>
        </Section>

        <Section title="Inventory Alerts">
          <div className="space-y-2">
            <KeyValueRow label="Low Stock" value={d.inventoryAlerts?.lowStock ?? 0} />
            <KeyValueRow label="Out of Stock" value={d.inventoryAlerts?.outOfStock ?? 0} />
          </div>
        </Section>
      </div>

      {d.employeePerformance?.length ? (
        <Section title="Team Performance">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-forest/10 text-left text-sm">
              <thead className="text-xs font-black uppercase text-forest">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Assigned Leads</th>
                  <th className="px-3 py-2">Converted</th>
                  <th className="px-3 py-2">Orders</th>
                  <th className="px-3 py-2">Booked Value</th>
                  <th className="px-3 py-2">Present Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {d.employeePerformance.map((row) => (
                  <tr key={row.employee?._id}>
                    <td className="px-3 py-2 font-semibold text-ink">
                      {row.employee?.name || row.employee?.employeeCode || "Unknown"}
                    </td>
                    <td className="px-3 py-2 text-muted">{row.assignedLeads}</td>
                    <td className="px-3 py-2 text-muted">{row.convertedLeads}</td>
                    <td className="px-3 py-2 text-muted">{row.orders}</td>
                    <td className="px-3 py-2 text-muted">{formatMoney(row.bookedOrderValue)}</td>
                    <td className="px-3 py-2 text-muted">{row.attendanceSummary?.presentDays ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
