import { Link } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { useAuth } from "../../../core/auth";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import {
  formatEmploymentType,
  getEmployeeDisplayName,
  getEmployeeEmail,
} from "../utils";
import { useEmployeeLocations } from "../hooks/useEmployeeLocations";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import UserAccountStatusBadge from "./UserAccountStatusBadge";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

const formatLocation = (regionLabel, districtLabel) => {
  if (regionLabel && districtLabel) return `${regionLabel} / ${districtLabel}`;
  return regionLabel || districtLabel || "Not Set";
};

export default function EmployeeTable({ employees = [], onApprove, onReject, showApprovalActions = false }) {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission(PERMISSIONS.EMPLOYEES_UPDATE);
  const canApprove = hasPermission(PERMISSIONS.EMPLOYEES_APPROVE);
  // region/district arrive as raw ids on the employee payload, so names
  // are resolved here rather than by the API.
  const { districtName, regionName } = useEmployeeLocations();

  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Employee Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Employment Type</th>
              <th className="px-4 py-3">Employee Status</th>
              <th className="px-4 py-3">Account Status</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Joining Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {employees.map((employee) => (
              <tr className="align-top transition hover:bg-mint/35" key={employee._id}>
                <td className="px-4 py-3 font-black text-forest">{employee.employeeCode || "Not Assigned"}</td>
                <td className="px-4 py-3 font-bold text-ink">{getEmployeeDisplayName(employee)}</td>
                <td className="px-4 py-3 text-muted">{getEmployeeEmail(employee) || "Not Available"}</td>
                <td className="px-4 py-3 text-muted">{employee.phone || "Not Available"}</td>
                <td className="px-4 py-3 text-muted">{employee.department || employee.requestedDepartment || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">
                  {employee.designation || employee.requestedDesignation || "Not Set"}
                </td>
                <td className="px-4 py-3 text-muted">{formatEmploymentType(employee.employmentType)}</td>
                <td className="px-4 py-3">
                  <EmployeeStatusBadge status={employee.employeeStatus} />
                </td>
                <td className="px-4 py-3">
                  <UserAccountStatusBadge status={employee.user?.status} />
                </td>
                <td className="px-4 py-3 text-muted">{employee.manager?.user?.name || "Not Assigned"}</td>
                <td className="px-4 py-3 text-muted">
                  {formatLocation(regionName(employee.region), districtName(employee.district))}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(employee.dateOfJoining)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      aria-label={`View ${getEmployeeDisplayName(employee)}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                      to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employee._id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {canUpdate && !showApprovalActions ? (
                      <Link
                        aria-label={`Edit ${getEmployeeDisplayName(employee)}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-forest ring-1 ring-forest/15 transition hover:bg-mint"
                        to={`${ROUTES.SUPER_ADMIN.EMPLOYEES}/${employee._id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    ) : null}
                    {showApprovalActions && canApprove ? (
                      <>
                        <button
                          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-forest px-3 text-xs font-bold text-white transition hover:bg-agriculture"
                          onClick={() => onApprove?.(employee)}
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
                          onClick={() => onReject?.(employee)}
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
