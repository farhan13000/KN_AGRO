import EmployeeStatusBadge from "./EmployeeStatusBadge";
import UserAccountStatusBadge from "./UserAccountStatusBadge";

export default function EmployeeDualStatus({ employee }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-forest/10">
        <span className="text-xs font-black uppercase text-forest">Employment</span>
        <EmployeeStatusBadge status={employee?.employeeStatus} />
      </span>
      <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-forest/10">
        <span className="text-xs font-black uppercase text-forest">Account</span>
        <UserAccountStatusBadge status={employee?.user?.status} />
      </span>
    </div>
  );
}
