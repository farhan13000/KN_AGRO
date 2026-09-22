import { useCallback, useEffect, useState } from "react";
import { Target } from "lucide-react";
import Card from "../../shared/components/Card";
import { DataTable } from "../../shared/components";
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

  const columns = [
    {
      key: "employee",
      header: "Employee",
      role: "title",
      cellClassName: "font-semibold text-ink",
      cell: (row) => row.employee.name || row.employee.employeeCode,
    },
    {
      key: "role",
      header: "Role",
      cellClassName: "text-muted",
      cell: (row) => ROLE_LABELS[row.role] || String(row.role || "").toUpperCase(),
    },
    {
      key: "target",
      header: "Target",
      align: "right",
      cellClassName: "tabular-nums",
      cell: (row) => (row.target === null ? "—" : formatMoney(row.target)),
    },
    {
      key: "achieved",
      header: "Billed",
      align: "right",
      cellClassName: "font-bold tabular-nums",
      cell: (row) => formatMoney(row.achieved),
    },
    {
      key: "bills",
      header: "Bills",
      align: "right",
      cellClassName: "tabular-nums",
      cell: (row) => row.bills,
    },
    {
      key: "progress",
      header: "Progress",
      headerClassName: "w-48",
      // The bar needs width to mean anything, so on a card it takes the
      // whole row rather than half of it.
      cardClassName: "col-span-2",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <ProgressBar percent={row.percent} />
          <span className="w-12 text-right text-xs font-bold tabular-nums text-ink">
            {row.percent === null ? "—" : `${row.percent}%`}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div data-team-targets>
      <DataTable
        columns={columns}
        minWidth="640px"
        rowKey={(row) => row.employee._id}
        rows={rows}
        theadClassName="text-xs font-black uppercase text-forest"
      />
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
        {/* A form, not a data grid: on a phone each role stacks into its
            own labelled block instead of scrolling sideways. */}
        <div className="mt-4 divide-y divide-forest/10">
          {(targetsState.data?.targets || []).map((item) => (
            <div
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              key={item.role}
            >
              <label className="text-sm font-bold text-ink sm:w-40 sm:shrink-0" htmlFor={`target-${item.role}`}>
                {ROLE_LABELS[item.role] || item.role.toUpperCase()}
              </label>
              <div className="flex flex-1 items-center gap-2">
                <span className="text-muted">₹</span>
                <input
                  className="form-field w-full sm:max-w-[200px]"
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
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-4 py-2 text-sm font-bold text-white transition hover:bg-agriculture disabled:opacity-60"
                disabled={saving === item.role}
                onClick={() => save(item.role)}
                type="button"
              >
                {saving === item.role ? "Saving…" : "Save"}
              </button>
            </div>
          ))}
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
