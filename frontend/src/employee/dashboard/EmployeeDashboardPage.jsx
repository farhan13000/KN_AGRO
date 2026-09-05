import DashboardShell from "../../shared/components/DashboardShell";
import { PermissionGuard } from "../../core/auth";
import { PERMISSIONS } from "../../shared/constants";
import { EmployeeDashboardContent } from "../../features/analytics";
import { AttendanceTodayWidget } from "../../features/attendance";

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardShell
        description="Your access starts with account identity and a protected workspace."
        title="My Dashboard"
      />
      {/* Org-hierarchy migration (Phase F17) — real check-in/check-out,
          alongside (not replacing) Phase F12's own read-only attendance
          stats inside EmployeeDashboardContent below. */}
      <PermissionGuard permission={PERMISSIONS.ATTENDANCE_CHECK_IN}>
        <AttendanceTodayWidget />
      </PermissionGuard>
      {/* Org-hierarchy migration (Phase F12) — attendance/DSR/leave/
          payroll now genuinely arrive here, via the pre-existing central
          analytics module's own Employee Dashboard endpoint. */}
      <PermissionGuard permission={PERMISSIONS.ANALYTICS_EMPLOYEE}>
        <EmployeeDashboardContent />
      </PermissionGuard>
    </div>
  );
}

