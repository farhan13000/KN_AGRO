import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { DataTable, rowIconActionClass } from "../../../shared/components";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { EMPLOYEE_STATUS } from "../constants";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

const formatDate = (value) => {
  if (!value) return "Not Available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Available";
  return parsed.toLocaleDateString();
};

export default function PendingApplicationsTable({ applications = [], onApprove, onReject }) {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission(PERMISSIONS.EMPLOYEES_APPROVE);

  const columns = [
    {
      key: "employeeCode",
      header: "Employee Code",
      cellClassName: "font-black text-forest",
      cell: (application) => application.employeeCode || "Not Assigned",
    },
    {
      key: "name",
      header: "Name",
      role: "title",
      cellClassName: "font-bold text-ink",
      cell: (application) => application.applicant?.name || "Applicant",
    },
    {
      key: "email",
      header: "Email",
      cellClassName: "text-muted",
      cell: (application) => {
        const email = application.applicant?.email;
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
      cell: (application) =>
        application.phone ? (
          <a className="font-semibold text-forest md:font-normal md:text-muted" href={`tel:${application.phone}`}>
            {application.phone}
          </a>
        ) : (
          "Not Available"
        ),
    },
    {
      key: "requestedDepartment",
      header: "Requested Department",
      cellClassName: "text-muted",
      cell: (application) => application.requestedDepartment || "Not Set",
    },
    {
      key: "requestedDesignation",
      header: "Requested Designation",
      cellClassName: "text-muted",
      cell: (application) => application.requestedDesignation || "Not Set",
    },
    {
      key: "createdAt",
      header: "Registration Date",
      cellClassName: "text-muted",
      cell: (application) => formatDate(application.createdAt),
    },
    {
      key: "status",
      header: "Status",
      role: "badge",
      cell: () => <EmployeeStatusBadge status={EMPLOYEE_STATUS.PENDING_APPROVAL} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      role: "actions",
      cell: (application) => (
        <div className="flex justify-end gap-2">
          <Link
            aria-label={`Review ${application.applicant?.name || "application"}`}
            className={rowIconActionClass}
            to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${application._id}`}
          >
            <Eye className="h-4 w-4" />
          </Link>
          {canApprove ? (
            <>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-3 text-xs font-bold text-white transition hover:bg-agriculture md:min-h-9"
                onClick={() => onApprove?.(application)}
                type="button"
              >
                Approve
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 md:min-h-9"
                onClick={() => onReject?.(application)}
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

  return <DataTable columns={columns} minWidth="760px" rows={applications} />;
}
