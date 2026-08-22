import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { ROUTES } from "../../../shared/constants";
import { formatEmploymentType, getEmployeeDisplayName } from "../utils";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

const formatDate = (value) => {
  if (!value) return "Not Set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not Set";
  return parsed.toLocaleDateString();
};

export default function TeamMembersTable({ employees = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full divide-y divide-forest/10 text-left text-sm">
          <thead className="bg-mint/70 text-xs font-black uppercase text-forest">
            <tr>
              <th className="px-4 py-3">Employee Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Employment Type</th>
              <th className="px-4 py-3">Employee Status</th>
              <th className="px-4 py-3">Joining Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {employees.map((employee) => (
              <tr className="align-top transition hover:bg-mint/35" key={employee._id}>
                <td className="px-4 py-3 font-black text-forest">{employee.employeeCode || "Not Assigned"}</td>
                <td className="px-4 py-3 font-bold text-ink">{getEmployeeDisplayName(employee)}</td>
                <td className="px-4 py-3 text-muted">{employee.department || "Not Set"}</td>
                <td className="px-4 py-3 text-muted">{employee.designation || "Not Set"}</td>
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
                      to={`${ROUTES.SALES_MANAGER.TEAM}/${employee._id}`}
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
