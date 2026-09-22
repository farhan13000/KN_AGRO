import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { DataTable, rowActionClass } from "../../../shared/components";
import { ROUTES } from "../../../shared/constants";
import { formatEmploymentType, getEmployeeDisplayName } from "../utils";
import EmployeeRoleBadge from "./EmployeeRoleBadge";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import Avatar from "../../../shared/components/Avatar";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

/**
 * `detailPathFor` says where a row leads. Each portal owns its own URL
 * space for a team member, so the manager path is only the fallback for
 * callers that predate the prop — not a default every portal should use.
 */
export default function TeamMembersTable({
  detailPathFor = (employee) => `${ROUTES.SALES_MANAGER.TEAM}/${employee._id}`,
  employees = [],
}) {
  const columns = [
    {
      key: "employeeCode",
      header: "Employee Code",
      cellClassName: "font-black text-forest",
      cell: (employee) => employee.employeeCode || "Not Assigned",
    },
    {
      key: "name",
      header: "Name",
      role: "title",
      cellClassName: "font-bold text-ink",
      cell: (employee) => (
        <span className="flex items-center gap-2">
          <Avatar name={getEmployeeDisplayName(employee)} src={employee.photo?.url || ""} />
          <span className="min-w-0 truncate">{getEmployeeDisplayName(employee)}</span>
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      role: "badge",
      cell: (employee) => <EmployeeRoleBadge employee={employee} />,
    },
    {
      key: "department",
      header: "Department",
      cellClassName: "text-muted",
      cell: (employee) => employee.department || "Not Set",
    },
    {
      key: "designation",
      header: "Designation",
      cellClassName: "text-muted",
      cell: (employee) => employee.designation || "Not Set",
    },
    {
      key: "employmentType",
      header: "Employment Type",
      cellClassName: "text-muted",
      cell: (employee) => formatEmploymentType(employee.employmentType),
    },
    {
      key: "employeeStatus",
      header: "Employee Status",
      role: "badge",
      cell: (employee) => <EmployeeStatusBadge status={employee.employeeStatus} />,
    },
    {
      key: "dateOfJoining",
      header: "Joining Date",
      cellClassName: "text-muted",
      cell: (employee) => formatDate(employee.dateOfJoining),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (employee) => (
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

  return <DataTable columns={columns} minWidth="760px" rows={employees} />;
}
