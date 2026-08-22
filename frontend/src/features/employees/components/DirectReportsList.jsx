import { Link } from "react-router-dom";
import { ROUTES } from "../../../shared/constants";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useDirectReports } from "../hooks";
import { getEmployeeDisplayName } from "../utils";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

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

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[620px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Employee Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Employee Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {reports.map((report) => (
              <tr className="transition hover:bg-mint/35" key={report._id}>
                <td className="px-4 py-3">
                  <Link className="font-black text-forest" to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${report._id}`}>
                    {report.employeeCode || "Not Assigned"}
                  </Link>
                </td>
                <td className="px-4 py-3 font-bold text-ink">{getEmployeeDisplayName(report)}</td>
                <td className="px-4 py-3 text-muted">{report.designation || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{report.department || "Not Set"}</td>
                <td className="px-4 py-3">
                  <EmployeeStatusBadge status={report.employeeStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
