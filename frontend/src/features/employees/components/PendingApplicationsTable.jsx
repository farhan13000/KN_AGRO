import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useAuth } from "../../../core/auth";
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

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Employee Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Requested Department</th>
              <th className="px-4 py-3">Requested Designation</th>
              <th className="px-4 py-3">Registration Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {applications.map((application) => (
              <tr className="align-top transition hover:bg-mint/35" key={application._id}>
                <td className="px-4 py-3 font-black text-forest">
                  {application.employeeCode || "Not Assigned"}
                </td>
                <td className="px-4 py-3 font-bold text-ink">{application.applicant?.name || "Applicant"}</td>
                <td className="px-4 py-3 text-muted">{application.applicant?.email || "Not Available"}</td>
                <td className="px-4 py-3 text-muted">{application.phone || "Not Available"}</td>
                <td className="px-4 py-3 text-muted">{application.requestedDepartment || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{application.requestedDesignation || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{formatDate(application.createdAt)}</td>
                <td className="px-4 py-3">
                  <EmployeeStatusBadge status={EMPLOYEE_STATUS.PENDING_APPROVAL} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      aria-label={`Review ${application.applicant?.name || "application"}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${application._id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {canApprove ? (
                      <>
                        <button
                          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-forest px-3 text-xs font-bold text-white transition hover:bg-agriculture"
                          onClick={() => onApprove?.(application)}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
                          onClick={() => onReject?.(application)}
                          type="button"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
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
