import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Crown, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import { getEmployeeDisplayName } from "../utils";

const roleOf = (employee) => employee?.user?.role?.name || "";

/**
 * Manager -> direct reports, plus the set of ids present in this list.
 *
 * `byId` matters as much as the children map: the employee list is
 * scope-filtered server-side, so a manager referenced by someone in the
 * list may not be in it. Anything whose manager is absent is treated as a
 * root rather than silently dropped.
 */
const indexByManager = (employees) => {
  const byId = new Map(employees.map((employee) => [String(employee._id), employee]));
  const childrenByManager = new Map();

  for (const employee of employees) {
    const managerId = employee.manager?._id ? String(employee.manager._id) : null;
    if (!managerId || !byId.has(managerId)) continue;
    if (!childrenByManager.has(managerId)) childrenByManager.set(managerId, []);
    childrenByManager.get(managerId).push(employee);
  }
  return { byId, childrenByManager };
};

const countBelow = (employee, childrenByManager) => {
  const kids = childrenByManager.get(String(employee._id)) || [];
  return kids.reduce((total, kid) => total + 1 + countBelow(kid, childrenByManager), 0);
};

/* ------------------------------------------------------------------ */

function PersonRow({ childrenByManager, detailPathFor, depth, employee, defaultOpen }) {
  const kids = childrenByManager.get(String(employee._id)) || [];
  const [open, setOpen] = useState(defaultOpen);
  const role = roleOf(employee);
  const below = kids.length ? countBelow(employee, childrenByManager) : 0;
  const name = getEmployeeDisplayName(employee);

  return (
    <li>
      <div className="flex items-start gap-2">
        {kids.length ? (
          <button
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${name}'s team`}
            className="mt-3 shrink-0 rounded p-0.5 text-forest transition hover:bg-mint"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span aria-hidden="true" className="mt-3 h-5 w-5 shrink-0" />
        )}

        <Link
          className="group my-1 flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 rounded-lg border border-forest/10 bg-white px-4 py-2.5 shadow-sm transition hover:border-forest/30 hover:bg-mint/40"
          to={detailPathFor(employee)}
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-ink group-hover:underline">{name}</span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-muted">
              {[
                role ? role.toUpperCase() : null,
                employee.employeeCode,
                employee.designation,
                kids.length ? `${kids.length} direct · ${below} in team` : null,
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </span>
          </span>
          <EmployeeStatusBadge status={employee.employeeStatus} />
        </Link>
      </div>

      {kids.length && open ? (
        <ul className="ml-2 mt-1 grid gap-1 border-l border-dashed border-forest/25 pl-4">
          {kids.map((kid) => (
            <PersonRow
              childrenByManager={childrenByManager}
              defaultOpen={false}
              depth={depth + 1}
              detailPathFor={detailPathFor}
              employee={kid}
              key={kid._id}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------ */

function TopNode({ children: slot, icon: Icon, subtitle, title }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-forest/20 bg-mint/50 px-4 py-3">
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-forest" />
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-ink">{title}</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-muted">{subtitle}</p>
      </div>
      {slot}
    </div>
  );
}

/**
 * The company as an org chart, in the shape the business actually has:
 * the owner on top, the Office Admin beneath them, then one branch per
 * General Manager holding that GM's entire chain.
 *
 * The top two rows are composed, not read from the reporting chain, and
 * deliberately so — SA and OA sit OUTSIDE it. SA usually has no Employee
 * record at all, and OA has one with nobody reporting to it, so neither
 * can be derived from `manager` links. Drawing them from role instead is
 * what makes the picture match how the company is actually run rather
 * than how the sales chain happens to be stored.
 *
 * GM branches start collapsed: with several GMs the point of this screen
 * is choosing a team first, and an all-expanded tree buries that.
 */
export default function OrgChartTree({ detailPathFor, employees = [], superAdminName }) {
  const { childrenByManager, generalManagers, officeAdmins, detached } = useMemo(() => {
    const indexed = indexByManager(employees);
    const gms = employees.filter((employee) => roleOf(employee) === "gm");
    const oas = employees.filter((employee) => roleOf(employee) === "oa");

    // Anyone who is neither a GM nor an OA and whose manager is not in the
    // list — they belong to no GM's branch, so they would otherwise vanish.
    const gmIds = new Set(gms.map((gm) => String(gm._id)));
    const oaIds = new Set(oas.map((oa) => String(oa._id)));
    const orphans = employees.filter((employee) => {
      const id = String(employee._id);
      if (gmIds.has(id) || oaIds.has(id)) return false;
      if (roleOf(employee) === "sa") return false;
      const managerId = employee.manager?._id ? String(employee.manager._id) : null;
      return !managerId || !indexed.byId.has(managerId);
    });

    return {
      ...indexed,
      generalManagers: gms,
      officeAdmins: oas,
      detached: orphans,
    };
  }, [employees]);

  if (!employees.length) {
    return <EmptyState description="No active employees are visible to you." title="No hierarchy data" />;
  }

  const totalInTeams = generalManagers.reduce((sum, gm) => sum + 1 + countBelow(gm, childrenByManager), 0);

  return (
    <div className="grid gap-3">
      <TopNode
        icon={Crown}
        subtitle="Owner · full access to every team and record"
        title={superAdminName || "Super Admin"}
      />

      <div className="ml-4 border-l border-dashed border-forest/25 pl-5">
        {officeAdmins.length ? (
          officeAdmins.map((oa) => (
            <div className="mb-3" key={oa._id}>
              <Link className="block" to={detailPathFor(oa)}>
                <TopNode
                  icon={ShieldCheck}
                  subtitle={`Office Admin · ${oa.employeeCode || "no code"} · runs the company for the owner`}
                  title={getEmployeeDisplayName(oa)}
                />
              </Link>
            </div>
          ))
        ) : (
          <div className="mb-3">
            <TopNode
              icon={ShieldCheck}
              subtitle="No Office Admin has an employee record yet"
              title="Office Admin"
            />
          </div>
        )}

        <div className="ml-4 border-l border-dashed border-forest/25 pl-5">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-muted">
            {generalManagers.length
              ? `${generalManagers.length} general manager${generalManagers.length === 1 ? "" : "s"} · ${totalInTeams} people in teams`
              : "General managers"}
          </p>

          {generalManagers.length ? (
            <ul className="grid gap-1">
              {generalManagers.map((gm) => (
                <PersonRow
                  childrenByManager={childrenByManager}
                  defaultOpen={false}
                  depth={0}
                  detailPathFor={detailPathFor}
                  employee={gm}
                  key={gm._id}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No General Manager has been appointed yet.</p>
          )}
        </div>
      </div>

      {detached.length ? (
        <section className="mt-4 rounded-lg border border-dashed border-forest/25 bg-white p-4">
          <div className="flex items-center gap-2">
            <Users aria-hidden="true" className="h-4 w-4 text-muted" />
            <h2 className="text-sm font-black text-ink">Outside every GM's chain</h2>
          </div>
          {/* Not a styling choice — these people report to nobody in the
              tree, so no manager can see them. Surfacing them here is the
              only place that gap is visible. */}
          <p className="mt-1 text-xs text-muted">
            {detached.length} {detached.length === 1 ? "person is" : "people are"} not under any General
            Manager, so no manager can see them. Assign each one a manager to bring them into a team.
          </p>
          <ul className="mt-3 grid gap-1">
            {detached.map((employee) => (
              <PersonRow
                childrenByManager={childrenByManager}
                defaultOpen={false}
                depth={0}
                detailPathFor={detailPathFor}
                employee={employee}
                key={employee._id}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
