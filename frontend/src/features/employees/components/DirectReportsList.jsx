import { Link } from "react-router-dom";
import { DataTable } from "../../../shared/components";
import { ROUTES } from "../../../shared/constants";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useDirectReports } from "../hooks";
import { getEmployeeDisplayName } from "../utils";
import EmployeeRoleBadge from "./EmployeeRoleBadge";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import Avatar from "../../../shared/components/Avatar";

export default function DirectReportsList({ employeeId }) {
  const reportsState = useDirectReports(employeeId, { page: 1, limit: 10 });
  const reports = reportsState.data?.employees || [];

  if (reportsState.isLoading) {
    return <PageLoader message="Loading direct reports..." />;
  }

  if (reportsState.isError) {
    return <ErrorState message={reportsState.errorMessage} title="Unable to load direct reports" />;
  }

  if (!reports.length) {
    return <EmptyState description="This employee has no direct reports." title="No direct reports" />;
  }

  const columns = [
    {
      key: "employeeCode",
      header: "Employee Code",
      cell: (report) => (
        <Link className="font-black text-forest" to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${report._id}`}>
          {report.employeeCode || "Not Assigned"}
        </Link>
      ),
    },
    {
      key: "name",
      header: "Name",
      role: "title",
      cellClassName: "font-bold text-ink",
      cell: (report) => (
        <span className="flex items-center gap-2">
          <Avatar name={getEmployeeDisplayName(report)} src={report.photo?.url || ""} />
          <span className="min-w-0 truncate">{getEmployeeDisplayName(report)}</span>
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      role: "badge",
      cell: (report) => <EmployeeRoleBadge employee={report} />,
    },
    {
      key: "designation",
      header: "Designation",
      cellClassName: "text-muted",
      cell: (report) => report.designation || "Not Set",
    },
    {
      key: "department",
      header: "Department",
      cellClassName: "text-muted",
      cell: (report) => report.department || "Not Set",
    },
    {
      key: "employeeStatus",
      header: "Employee Status",
      role: "badge",
      cell: (report) => <EmployeeStatusBadge status={report.employeeStatus} />,
    },
  ];

  return <DataTable columns={columns} minWidth="620px" rows={reports} />;
}
