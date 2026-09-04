import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import EmptyState from "../../../shared/components/EmptyState";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import { getEmployeeDisplayName } from "../utils";

// Indentation stops growing past this depth so a long chain
// (GM -> RM -> ASM -> SO -> FO and beyond) can't push the tree off-screen.
const MAX_INDENT_DEPTH = 4;
const INDENT_PER_LEVEL = 20;

/**
 * Groups a flat employee list into a manager -> reports map, and works out
 * which nodes are roots.
 *
 * A root is anyone with no manager AND anyone whose manager isn't in this
 * list — the second case matters because the backend scope-filters the
 * list to the actor's own downline, so an RM viewing their team sees
 * themselves with a `manager` (their GM) who isn't in the response. Without
 * that rule those employees would be silently dropped from the tree.
 */
const buildTree = (employees) => {
  const byId = new Map(employees.map((employee) => [String(employee._id), employee]));
  const childrenByManagerId = new Map();

  for (const employee of employees) {
    const managerId = employee.manager?._id ? String(employee.manager._id) : null;
    if (!managerId || !byId.has(managerId)) continue;
    if (!childrenByManagerId.has(managerId)) childrenByManagerId.set(managerId, []);
    childrenByManagerId.get(managerId).push(employee);
  }

  const roots = employees.filter((employee) => {
    const managerId = employee.manager?._id ? String(employee.manager._id) : null;
    return !managerId || !byId.has(managerId);
  });

  return { childrenByManagerId, roots };
};

const countDescendants = (employee, childrenByManagerId) => {
  const children = childrenByManagerId.get(String(employee._id)) || [];
  return children.reduce((total, child) => total + 1 + countDescendants(child, childrenByManagerId), 0);
};

function HierarchyNode({ childrenByManagerId, depth, employee }) {
  const children = childrenByManagerId.get(String(employee._id)) || [];
  const hasChildren = children.length > 0;
  const [open, setOpen] = useState(true);
  const indent = Math.min(depth, MAX_INDENT_DEPTH) * INDENT_PER_LEVEL;
  const roleName = employee.user?.role?.name;
  const totalBelow = hasChildren ? countDescendants(employee, childrenByManagerId) : 0;

  return (
    <div style={{ marginLeft: depth === 0 ? 0 : indent }}>
      <div
        className={`rounded-lg border bg-white p-4 shadow-sm ${
          hasChildren ? "border-forest/15" : "border-forest/10"
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            {hasChildren ? (
              <button
                aria-expanded={open}
                aria-label={open ? `Collapse ${getEmployeeDisplayName(employee)}` : `Expand ${getEmployeeDisplayName(employee)}`}
                className="mt-0.5 shrink-0 text-forest"
                onClick={() => setOpen((current) => !current)}
                type="button"
              >
                {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            ) : (
              <span aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-ink">{getEmployeeDisplayName(employee)}</p>
              <p className="mt-1 truncate text-xs font-semibold text-muted">
                {employee.employeeCode || "No code"}
                {roleName ? ` | ${roleName.toUpperCase()}` : ""}
                {` | ${employee.designation || "No designation"}`}
                {hasChildren ? ` | ${children.length} direct, ${totalBelow} total below` : ""}
              </p>
            </div>
          </div>
          <EmployeeStatusBadge status={employee.employeeStatus} />
        </div>
      </div>

      {hasChildren && open ? (
        <div className="mt-3 grid gap-3 border-l-2 border-mint pl-4">
          {children.map((child) => (
            <HierarchyNode
              childrenByManagerId={childrenByManagerId}
              depth={depth + 1}
              employee={child}
              key={child._id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Renders an org tree of ANY depth from a flat employee list.
 *
 * Built client-side from the ordinary employee list rather than the
 * backend's /employees/hierarchy endpoint: that endpoint still hardcodes
 * the legacy two-level model (it classifies managers by
 * `role === "sales_manager"` and returns {managers, unassignedEmployees}),
 * so under the new 7-role hierarchy every GM/RM/ASM/SO would come back
 * misfiled as unassigned staff.
 */
export default function EmployeeHierarchyTree({ employees = [] }) {
  const { childrenByManagerId, roots } = useMemo(() => buildTree(employees), [employees]);

  if (!employees.length) {
    return <EmptyState description="No active employees are visible to you." title="No hierarchy data" />;
  }

  return (
    <div className="grid gap-4">
      {roots.map((employee) => (
        <HierarchyNode
          childrenByManagerId={childrenByManagerId}
          depth={0}
          employee={employee}
          key={employee._id}
        />
      ))}
    </div>
  );
}
