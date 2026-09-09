import { Link } from "react-router-dom";
import { CornerDownRight, Eye } from "lucide-react";
import { formatEmploymentType, getEmployeeDisplayName } from "../utils";
import EmployeeRoleBadge from "./EmployeeRoleBadge";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

/**
 * A manager's whole downline as a tree, not a list of direct reports.
 *
 * The rows arrive flat (GET /employees/my-team returns everyone below the
 * caller, at any depth) and each carries its own `manager`, so the shape
 * is rebuilt here rather than asked for as nested JSON: the same rows
 * still page, filter and search like any other list.
 *
 * Anyone whose manager is not in the set is treated as a root. That is
 * what makes the view degrade sensibly under a search or a status filter,
 * where the intermediate manager may not be among the matches — the
 * person is still shown, just at the top level instead of hidden.
 */
const buildForest = (employees) => {
  const byId = new Map(employees.map((employee) => [String(employee._id), employee]));
  const childrenOf = new Map();
  const roots = [];

  employees.forEach((employee) => {
    const managerId = employee.manager?._id ? String(employee.manager._id) : null;
    if (managerId && byId.has(managerId)) {
      if (!childrenOf.has(managerId)) childrenOf.set(managerId, []);
      childrenOf.get(managerId).push(employee);
    } else {
      roots.push(employee);
    }
  });

  // Depth-first, so a person always appears directly under their manager.
  const ordered = [];
  const walk = (employee, depth) => {
    ordered.push({ employee, depth });
    (childrenOf.get(String(employee._id)) || []).forEach((child) => walk(child, depth + 1));
  };
  roots.forEach((root) => walk(root, 0));
  return ordered;
};

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Not Set" : parsed.toLocaleDateString();
};

export default function TeamHierarchyTable({ detailPathFor, employees = [] }) {
  const rows = buildForest(employees);

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Reports To</th>
              <th className="px-4 py-3">Employee Code</th>
              <th className="px-4 py-3">Employment Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joining Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {rows.map(({ depth, employee }) => (
              <tr className="align-middle transition hover:bg-mint/35" key={employee._id}>
                <td className="px-4 py-3">
                  <span
                    className="flex items-center gap-2 font-bold text-ink"
                    // Indentation is the tree. Inline because the depth is
                    // data, not one of a fixed set of Tailwind classes.
                    style={{ paddingLeft: `${depth * 22}px` }}
                  >
                    {depth ? <CornerDownRight className="h-4 w-4 shrink-0 text-muted" /> : null}
                    {getEmployeeDisplayName(employee)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <EmployeeRoleBadge employee={employee} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {/* The manager's real name, including for your own direct
                      reports — naming you back is less useful than naming
                      the person, and this column has to stay correct for a
                      row whose manager is outside the current filter. */}
                  {employee.manager ? getEmployeeDisplayName(employee.manager) : "Not Set"}
                </td>
                <td className="px-4 py-3 font-black text-forest">
                  {employee.employeeCode || "Not Assigned"}
                </td>
                <td className="px-4 py-3 text-muted">{formatEmploymentType(employee.employmentType)}</td>
                <td className="px-4 py-3">
                  <EmployeeStatusBadge status={employee.employeeStatus} />
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(employee.dateOfJoining)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${getEmployeeDisplayName(employee)}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={detailPathFor(employee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
