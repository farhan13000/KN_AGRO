import { Link } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { DataTable, rowIconActionClass } from "../../../shared/components";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import {
  formatEmploymentType,
  getEmployeeDisplayName,
  getEmployeeEmail,
} from "../utils";
import EmployeeRoleBadge from "./EmployeeRoleBadge";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import UserAccountStatusBadge from "./UserAccountStatusBadge";
import Avatar from "../../../shared/components/Avatar";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

/** States (and, if narrow enough, districts) an employee's coverage names. */
const formatCoverage = (coverage) => {
  const states = coverage?.states ?? [];
  if (!states.length) return "Not Set";
  const districts = coverage?.districts ?? [];
  if (districts.length && districts.length <= 3) {
    return districts.map((entry) => entry.district).join(", ");
  }
  return states.join(", ");
};

export default function EmployeeTable({ employees = [], onApprove, onReject, showApprovalActions = false }) {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission(PERMISSIONS.EMPLOYEES_UPDATE);
  const canApprove = hasPermission(PERMISSIONS.EMPLOYEES_APPROVE);

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
      key: "email",
      header: "Email",
      cellClassName: "text-muted",
      cell: (employee) => {
        const email = getEmployeeEmail(employee);
        return email ? (
          <a className="break-all font-semibold text-forest md:font-normal md:text-muted" href={`mailto:${email}`}>
            {email}
          </a>
        ) : (
          "Not Available"
        );
      },
    },
    {
      key: "phone",
      header: "Phone",
      cellClassName: "text-muted",
      cell: (employee) =>
        employee.phone ? (
          <a className="font-semibold text-forest md:font-normal md:text-muted" href={`tel:${employee.phone}`}>
            {employee.phone}
          </a>
        ) : (
          "Not Available"
        ),
    },
    {
      key: "department",
      header: "Department",
      cellClassName: "text-muted",
      cell: (employee) => employee.department || employee.requestedDepartment || "Not Set",
    },
    {
      key: "designation",
      header: "Designation",
      cellClassName: "text-muted",
      cell: (employee) => employee.designation || employee.requestedDesignation || "Not Set",
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
      key: "accountStatus",
      header: "Account Status",
      role: "badge",
      cell: (employee) => <UserAccountStatusBadge status={employee.user?.status} />,
    },
    {
      key: "manager",
      header: "Manager",
      cellClassName: "text-muted",
      cell: (employee) => employee.manager?.user?.name || "Not Assigned",
    },
    {
      key: "coverage",
      header: "Location",
      cellClassName: "text-muted",
      cell: (employee) => formatCoverage(employee.coverage),
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
        <div className="flex justify-end gap-2">
          <Link
            aria-label={`View ${getEmployeeDisplayName(employee)}`}
            className={rowIconActionClass}
            to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employee._id}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
          {canUpdate && !showApprovalActions ? (
            <Link
              aria-label={`Edit ${getEmployeeDisplayName(employee)}`}
              className={rowIconActionClass}
              to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employee._id}/edit`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
          ) : null}
          {showApprovalActions && canApprove ? (
            <>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-3 text-xs font-bold text-white transition hover:bg-agriculture md:min-h-9"
                onClick={() => onApprove?.(employee)}
                type="button"
              >
                Approve
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 md:min-h-9"
                onClick={() => onReject?.(employee)}
                type="button"
              >
                Reject
              </button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} minWidth="980px" rows={employees} />;
}
