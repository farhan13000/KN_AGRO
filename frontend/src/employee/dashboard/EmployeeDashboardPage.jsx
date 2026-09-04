import DashboardShell from "../../shared/components/DashboardShell";
import { PermissionGuard } from "../../core/auth";
import { PERMISSIONS } from "../../shared/constants";
import { EmployeeDashboardContent } from "../../features/analytics";

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardShell
        description="Your access starts with account identity and a protected workspace."
        title="My Dashboard"
      />
      {/* Org-hierarchy migration (Phase F12) — attendance/DSR/leave/
          payroll now genuinely arrive here, via the pre-existing central
          analytics module's own Employee Dashboard endpoint. */}
      <PermissionGuard permission={PERMISSIONS.ANALYTICS_EMPLOYEE}>
        <EmployeeDashboardContent />
      </PermissionGuard>
    </div>
  );
}

