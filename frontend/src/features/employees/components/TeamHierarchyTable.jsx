import { Link } from "react-router-dom";
import { CornerDownRight, Eye } from "lucide-react";
import { DataTable, rowActionClass } from "../../../shared/components";
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

  const columns = [
    {
      key: "name",
      header: "Name",
      role: "title",
      cell: ({ depth, employee }) => (
        <span
          className="flex items-center gap-2 font-bold text-ink"
          // Indentation is the tree. Inline because the depth is data,
          // not one of a fixed set of Tailwind classes.
          style={{ paddingLeft: `${depth * 22}px` }}
        >
          {depth ? <CornerDownRight className="h-4 w-4 shrink-0 text-muted" /> : null}
          {getEmployeeDisplayName(employee)}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      role: "badge",
      cell: ({ employee }) => <EmployeeRoleBadge employee={employee} />,
    },
    {
      key: "manager",
      header: "Reports To",
      cellClassName: "text-muted",
      // The manager's real name, including for your own direct reports —
      // naming you back is less useful than naming the person, and this
      // column has to stay correct for a row whose manager is outside the
      // current filter.
      cell: ({ employee }) => (employee.manager ? getEmployeeDisplayName(employee.manager) : "Not Set"),
    },
    {
      key: "employeeCode",
      header: "Employee Code",
      cellClassName: "font-black text-forest",
      cell: ({ employee }) => employee.employeeCode || "Not Assigned",
    },
    {
      key: "employmentType",
      header: "Employment Type",
      cellClassName: "text-muted",
      cell: ({ employee }) => formatEmploymentType(employee.employmentType),
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: ({ employee }) => <EmployeeStatusBadge status={employee.employeeStatus} />,
    },
    {
      key: "dateOfJoining",
      header: "Joining Date",
      cellClassName: "text-muted",
      cell: ({ employee }) => formatDate(employee.dateOfJoining),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: ({ employee }) => (
        <div className="flex justify-end">
          <Link
            aria-label={`View ${getEmployeeDisplayName(employee)}`}
            className={rowActionClass}
            to={detailPathFor(employee)}
          >
            <Eye className="h-4 w-4" />
            <span className="md:sr-only">View</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      minWidth="860px"
      rowKey={({ employee }) => employee._id}
      rows={rows}
    />
  );
}
