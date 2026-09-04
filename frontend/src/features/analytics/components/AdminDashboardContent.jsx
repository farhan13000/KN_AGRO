import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { formatBusinessDateTime, formatMoney } from "../../../shared/utils";
import { useAdminDashboard } from "../hooks";
import { KeyValueRow, Section, Stat, StatGrid } from "./DashboardPrimitives";

const titleCase = (key) =>
  key
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

/**
 * SA (and legacy SUPER_ADMIN) dashboard — GET /analytics/admin/dashboard,
 * the pre-existing (Phase 8), company-wide (SCOPE.ALL) view. Not part of
 * this migration's own new-role Section 32 list (SA already had this),
 * but Phase F00/F12's own audit found it was still a placeholder shell on
 * the frontend — built now alongside the 5 new tiers since it's the same
 * "extend the existing dashboard shell" work.
 */
export default function AdminDashboardContent() {
  const state = useAdminDashboard();

  if (state.isLoading) return <PageLoader message="Loading dashboard..." />;
  if (state.isError) return <ErrorState message={state.errorMessage} title="Unable to load dashboard" />;

  const d = state.data;
  if (!d) return null;

  return (
    <div className="space-y-6">
      <StatGrid>
        <Stat label="Total Leads" value={d.kpis?.totalLeads} />
        <Stat label="Conversion Rate" value={`${d.kpis?.conversionRate ?? 0}%`} />
        <Stat label="Total Orders" value={d.kpis?.totalOrders} />
        <Stat label="Booked Order Value" money value={d.kpis?.bookedOrderValue} />
        <Stat label="Invoiced Value" money value={d.kpis?.invoicedValue} />
        <Stat label="Cash Collected" money value={d.kpis?.cashCollected} />
        <Stat label="Outstanding Receivables" money value={d.kpis?.outstandingReceivables} />
        <Stat label="Average Order Value" money value={d.kpis?.averageOrderValue} />
        <Stat label="Total Customers" value={d.kpis?.totalCustomers} />
        <Stat label="Total Employees" value={d.kpis?.totalEmployees} />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Lead Funnel">
          <div className="space-y-2">
            {(d.leadFunnel?.funnel || []).map((row) => (
              <KeyValueRow key={row.status} label={titleCase(row.status)} value={row.count} />
            ))}
            <KeyValueRow label="Expected Pipeline Value" value={formatMoney(d.leadFunnel?.expectedPipelineValue)} />
          </div>
        </Section>

        <Section title="Order Status">
          <div className="space-y-2">
            {(d.orderStatus || []).map((row) => (
              <KeyValueRow key={row.status} label={titleCase(row.status)} value={`${row.count} · ${formatMoney(row.value)}`} />
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Top Products">
          <ul className="space-y-2">
            {(d.topProducts || []).map((row) => (
              <li className="flex items-center justify-between text-sm" key={row.product?._id}>
                <span className="font-semibold text-ink">{row.product?.productName}</span>
                <span className="text-muted">{row.deliveredQuantity} delivered</span>
              </li>
            ))}
            {!d.topProducts?.length ? <p className="text-sm text-muted">No data yet.</p> : null}
          </ul>
        </Section>

        <Section title="Top Customers">
          <ul className="space-y-2">
            {(d.topCustomers || []).map((row) => (
              <li className="flex items-center justify-between text-sm" key={row.customer?.id}>
                <span className="font-semibold text-ink">{row.customer?.name || row.customer?.companyName}</span>
                <span className="text-muted">{formatMoney(row.bookedOrderValue)}</span>
              </li>
            ))}
            {!d.topCustomers?.length ? <p className="text-sm text-muted">No data yet.</p> : null}
          </ul>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Inventory">
          <div className="space-y-2">
            <KeyValueRow label="Low Stock" value={d.inventory?.lowStock ?? 0} />
            <KeyValueRow label="Out of Stock" value={d.inventory?.outOfStock ?? 0} />
            <KeyValueRow label="Purchase Value" value={formatMoney(d.inventory?.valuation?.purchaseValue)} />
            <KeyValueRow label="Potential Selling Value" value={formatMoney(d.inventory?.valuation?.potentialSellingValue)} />
          </div>
        </Section>

        <Section title="Operations">
          <div className="space-y-2">
            <KeyValueRow label="Pending Leaves" value={d.operations?.pendingLeaves ?? 0} />
            <KeyValueRow label="Overdue Reports" value={d.operations?.overdueReports ?? 0} />
            <KeyValueRow label="Draft Payroll" value={d.operations?.draftPayroll ?? 0} />
          </div>
        </Section>
      </div>

      {d.employees?.managerPerformance?.length ? (
        <Section title="Manager Performance (Top 10 by Team Size)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-forest/10 text-left text-sm">
              <thead className="text-xs font-black uppercase text-forest">
                <tr>
                  <th className="px-3 py-2">Manager</th>
                  <th className="px-3 py-2">Team Size</th>
                  <th className="px-3 py-2">Assigned Leads</th>
                  <th className="px-3 py-2">Orders</th>
                  <th className="px-3 py-2">Booked Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {d.employees.managerPerformance.map((row) => (
                  <tr key={row.manager?._id}>
                    <td className="px-3 py-2 font-semibold text-ink">{row.manager?.name || row.manager?.employeeCode}</td>
                    <td className="px-3 py-2 text-muted">{row.teamSize}</td>
                    <td className="px-3 py-2 text-muted">{row.assignedLeads}</td>
                    <td className="px-3 py-2 text-muted">{row.orders}</td>
                    <td className="px-3 py-2 text-muted">{formatMoney(row.bookedOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {d.pendingActions ? (
        <Section title="Pending Actions">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(d.pendingActions).map((action) => (
              <KeyValueRow key={action.label} label={action.label} value={action.value} />
            ))}
          </div>
        </Section>
      ) : null}

      {d.recentActivity?.length ? (
        <Section title="Recent Activity">
          <ul className="space-y-2">
            {d.recentActivity.map((activity, index) => (
              <li className="text-sm text-muted" key={index}>
                <span className="font-semibold text-ink">{activity.title}</span>
                {activity.performedBy ? ` · ${activity.performedBy}` : ""}
                {activity.at ? ` · ${formatBusinessDateTime(activity.at)}` : ""}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
