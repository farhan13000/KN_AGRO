import { useCallback, useEffect, useState } from "react";
import { Target } from "lucide-react";
import Card from "../../shared/components/Card";
import { useAuth } from "../../core/auth";
import { getApiErrorMessage } from "../../core/api";
import { ROLE_LABELS } from "../../shared/constants";
import { useAsyncResource } from "../../shared/hooks";
import { formatMoney } from "../../shared/utils";
import { salesTargetApi } from "./salesTargetApi";

const MANAGER_ROLES = ["gm", "rm", "asm", "so"];

const monthLabel = (month) => {
  if (!month) return "";
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
};

const currentMonth = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).format(new Date());

function ProgressBar({ percent }) {
  const width = Math.max(0, Math.min(percent ?? 0, 100));
  const tone = percent === null ? "bg-slate-300" : percent >= 100 ? "bg-green-600" : percent >= 60 ? "bg-forest" : "bg-amber-500";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-mint" role="progressbar" aria-valuenow={Math.round(width)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
}

/** The signed-in employee's own monthly target, billed so far, and %. */
export function SalesTargetProgressCard() {
  const request = useCallback(() => salesTargetApi.myProgress(), []);
  const state = useAsyncResource(["sales-targets", "me"], request);
  const data = state.data;
  if (!data?.hasProfile) return null;

  return (
    <Card className="p-5" data-my-target>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-black text-ink">
          <Target className="h-5 w-5 text-forest" />
          My Target · {monthLabel(data.month)}
        </h2>
        {data.percent !== null ? <span className="text-sm font-black text-forest">{data.percent}%</span> : null}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Target</dt>
          <dd className="mt-1 font-black text-ink">{data.target === null ? "Not set" : formatMoney(data.target)}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Billed</dt>
          <dd className="mt-1 font-black text-ink">{formatMoney(data.achieved)}</dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-wide text-muted">Bills</dt>
          <dd className="mt-1 font-black text-ink">{data.bills}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <ProgressBar percent={data.percent} />
      </div>
      <p className="mt-2 text-xs text-muted">Every bill made on a lead you brought counts here.</p>
    </Card>
  );
}

export function TargetProgressTable({ rows = [] }) {
  if (!rows.length) return <p className="text-sm text-muted">No sales team members yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] divide-y divide-forest/10 text-left text-sm" data-team-targets>
        <thead className="text-xs font-black uppercase text-forest">
          <tr>
            <th className="px-3 py-2">Employee</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2 text-right">Target</th>
            <th className="px-3 py-2 text-right">Billed</th>
            <th className="px-3 py-2 text-right">Bills</th>
            <th className="w-48 px-3 py-2">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-forest/10">
          {rows.map((row) => (
            <tr key={row.employee._id}>
              <td className="px-3 py-2 font-semibold text-ink">{row.employee.name || row.employee.employeeCode}</td>
              <td className="px-3 py-2 text-muted">{ROLE_LABELS[row.role] || String(row.role || "").toUpperCase()}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.target === null ? "—" : formatMoney(row.target)}</td>
              <td className="px-3 py-2 text-right font-bold tabular-nums">{formatMoney(row.achieved)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.bills}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <ProgressBar percent={row.percent} />
                  <span className="w-12 text-right text-xs font-bold tabular-nums text-ink">{row.percent === null ? "—" : `${row.percent}%`}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A manager's downline against their role targets for the month. */
export function TeamTargetProgressCard() {
  const { role } = useAuth();
  const isManager = MANAGER_ROLES.includes(role);
  const request = useCallback(() => salesTargetApi.teamProgress(), []);
  const state = useAsyncResource(["sales-targets", "team"], request, { enabled: isManager });
  if (!isManager || !state.data) return null;

  return (
    <Card className="p-5">
      <h2 className="flex items-center gap-2 text-lg font-black text-ink">
        <Target className="h-5 w-5 text-forest" />
        Team Targets · {monthLabel(state.data.month)}
      </h2>
      <div className="mt-3">
        <TargetProgressTable rows={state.data.rows} />
      </div>
    </Card>
  );
}

/** SA/OA: set each role's monthly target and see everyone's progress. */
export function SalesTargetsAdminView() {
  const [month, setMonth] = useState(currentMonth());
  const targetsRequest = useCallback(() => salesTargetApi.listTargets(), []);
  const targetsState = useAsyncResource(["sales-targets", "list"], targetsRequest);
  const progressRequest = useCallback(() => salesTargetApi.teamProgress(month), [month]);
  const progressState = useAsyncResource(["sales-targets", "team", month], progressRequest);

  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const targets = targetsState.data?.targets || [];
    setDrafts(Object.fromEntries(targets.map((item) => [item.role, item.monthlyAmount === null ? "" : String(item.monthlyAmount)])));
  }, [targetsState.data]);

  const save = async (role) => {
    const amount = Number(drafts[role]);
    if (drafts[role] === "" || !Number.isFinite(amount) || amount < 0) {
      setError(`Enter a valid amount for ${ROLE_LABELS[role] || role}.`);
      return;
    }
    setSaving(role);
    setError("");
    setMessage("");
    try {
      await salesTargetApi.setTarget(role, amount);
      setMessage(`${ROLE_LABELS[role] || role.toUpperCase()} target saved.`);
      await Promise.all([targetsState.refetch?.(), progressState.refetch?.()]);
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">Monthly target per role</h2>
        <p className="mt-1 text-sm text-muted">Everyone in a role follows the same target. Bills count toward the person who brought the lead.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <tbody className="divide-y divide-forest/10">
              {(targetsState.data?.targets || []).map((item) => (
                <tr key={item.role}>
                  <th className="py-2 pr-4 font-bold text-ink" scope="row">
                    {ROLE_LABELS[item.role] || item.role.toUpperCase()}
                  </th>
                  <td className="py-2 pr-3">
                    <label className="sr-only" htmlFor={`target-${item.role}`}>
                      Monthly target for {item.role}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted">₹</span>
                      <input
                        className="form-field max-w-[200px]"
                        id={`target-${item.role}`}
                        inputMode="decimal"
                        min="0"
                        onChange={(event) => setDrafts((current) => ({ ...current, [item.role]: event.target.value }))}
                        placeholder="Not set"
                        step="1"
                        type="number"
                        value={drafts[item.role] ?? ""}
                      />
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-forest px-4 py-2 text-sm font-bold text-white transition hover:bg-agriculture disabled:opacity-60"
                      disabled={saving === item.role}
                      onClick={() => save(item.role)}
                      type="button"
                    >
                      {saving === item.role ? "Saving…" : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-green-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-black text-ink">Progress · {monthLabel(month)}</h2>
          <label className="text-sm">
            <span className="form-label">Month</span>
            <input className="form-field" id="targets-month" onChange={(event) => setMonth(event.target.value || currentMonth())} type="month" value={month} />
          </label>
        </div>
        <div className="mt-3">
          {progressState.isError ? (
            <p className="text-sm font-semibold text-red-700">{progressState.errorMessage}</p>
          ) : (
            <TargetProgressTable rows={progressState.data?.rows || []} />
          )}
        </div>
      </Card>
    </div>
  );
}
