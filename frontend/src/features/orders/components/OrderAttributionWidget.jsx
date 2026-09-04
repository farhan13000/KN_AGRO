import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { ROLE_LABELS } from "../../../shared/constants";
import { useOrderAttributionRollup } from "../hooks";
import { formatOrderAmount } from "../utils";

const SCOPE_LABELS = Object.freeze({
  ALL: "Company-wide",
  OWN_TEAM: "Your downline",
  SELF: "Your own orders",
  NONE: "No orders in scope",
});

/**
 * Org-hierarchy migration (Phase F09/backend Phase 11). The backend's own
 * scope engine already resolves the correct bucket for whoever calls
 * `GET /orders/attribution` — an RM gets their regional total, a GM gets
 * company-wide, an SO gets their own team — so this widget only renders
 * whatever comes back, no role branching on the frontend. `role` on each
 * breakdown row is whichever employee's `attributionPath` the order
 * resolves to (last element) — see order.service.js#getAttributionRollup.
 */
export default function OrderAttributionWidget() {
  const state = useOrderAttributionRollup();

  if (state.isError) {
    return <ErrorState message={state.errorMessage} title="Unable to load sales attribution" />;
  }

  const rollup = state.rollup;
  const scopeLabel = rollup ? SCOPE_LABELS[rollup.scope] || rollup.scope : "";

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-black text-ink">Sales Attribution</h2>
        {scopeLabel ? (
          <span className="text-xs font-black uppercase tracking-wide text-agriculture">{scopeLabel}</span>
        ) : null}
      </div>

      {state.isLoading ? <p className="mt-4 text-sm font-semibold text-muted">Loading...</p> : null}

      {rollup ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-forest/10 bg-mint/50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-muted">Total Sales</p>
              <p className="mt-1 text-2xl font-black text-ink">{formatOrderAmount(rollup.totalSales)}</p>
            </div>
            <div className="rounded-lg border border-forest/10 bg-mint/50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-muted">Order Count</p>
              <p className="mt-1 text-2xl font-black text-ink">{rollup.orderCount}</p>
            </div>
          </div>

          {rollup.breakdown?.length ? (
            <ul className="mt-4 space-y-2">
              {rollup.breakdown.map((row) => (
                <li
                  className="flex items-center justify-between rounded-lg border border-forest/10 px-4 py-2 text-sm"
                  key={row.role}
                >
                  <span className="font-semibold text-ink">{ROLE_LABELS[row.role] || row.role}</span>
                  <span className="text-muted">
                    {row.orderCount} order{row.orderCount === 1 ? "" : "s"} ·{" "}
                    <span className="font-bold text-ink">{formatOrderAmount(row.totalSales)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
