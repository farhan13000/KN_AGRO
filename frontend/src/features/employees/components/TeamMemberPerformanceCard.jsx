import { useMemo } from "react";
import Card from "../../../shared/components/Card";
import { PERMISSIONS } from "../../../shared/constants";
import { useAuth } from "../../../core/auth";
import { formatMoney } from "../../../shared/utils";
import { useEmployeeLeadAnalytics } from "../../leads/hooks";

/**
 * One person's numbers, pulled from the scoped lead analytics endpoint
 * rather than the company-wide ANALYTICS_ADMIN one — the manager tier
 * holds `leads.analytics.read` but not `analytics.admin`, and this card
 * has to work for a manager looking at their own report.
 *
 * The endpoint returns a row per employee in the caller's scope; the row
 * for this employee is picked out here. No row means no leads have ever
 * been attributed to them, which is a real answer, not an error.
 *
 * Field names are the endpoint's own (`assignedLeads`, `conversionRate`
 * as a 0-1 fraction, `expectedPipelineValue` already in rupees) — read
 * off a live response, not guessed from the model.
 */
export default function TeamMemberPerformanceCard({ employeeId }) {
  const { hasPermission } = useAuth();
  const canRead = hasPermission(PERMISSIONS.LEADS_ANALYTICS_READ);
  const query = useMemo(() => ({}), []);
  const state = useEmployeeLeadAnalytics(query, { enabled: canRead });

  if (!canRead) return null;

  const rows = state.data?.employees || [];
  const row = rows.find((entry) => String(entry.employee?._id) === String(employeeId));

  const tiles = [
    { label: "Leads assigned", value: row?.assignedLeads ?? 0 },
    { label: "Converted", value: row?.convertedLeads ?? 0 },
    { label: "Conversion rate", value: `${Math.round((row?.conversionRate ?? 0) * 100)}%` },
    { label: "Qualified", value: row?.qualifiedLeads ?? 0 },
    { label: "Lost", value: row?.lostLeads ?? 0 },
    { label: "Overdue follow-ups", value: row?.overdueFollowUps ?? 0 },
    { label: "Open pipeline", value: formatMoney(row?.expectedPipelineValue ?? 0) },
  ];

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-ink">Performance</h2>
      <p className="mt-1 text-sm text-muted">
        {state.isLoading
          ? "Loading…"
          : row
            ? "Lead performance to date, from the same figures the analytics screens use."
            : "No leads have been attributed to this person yet."}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div className="rounded-lg bg-mint/40 p-4" key={tile.label}>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{tile.label}</p>
            <p className="mt-2 text-2xl font-black text-ink">{tile.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
