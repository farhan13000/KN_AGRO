import DashboardShell from "../../shared/components/DashboardShell";
import { PermissionGuard, useAuth } from "../../core/auth";
import { BACKEND_ROLES, PERMISSIONS, normalizeRoleName } from "../../shared/constants";
import { AdminDashboardContent } from "../../features/analytics";
import { AttendanceTodayWidget } from "../../features/attendance";

export default function SuperAdminDashboardPage() {
  const { role } = useAuth();
  // The Office Admin marks attendance like any other employee, so the
  // check-in card belongs on the first screen they open. The Super Admin
  // does not mark attendance — they are who verifies it.
  const marksOwnAttendance = normalizeRoleName(role) === BACKEND_ROLES.OA;

  return (
    <div className="space-y-6">
      <DashboardShell
        description="Sales, stock, staff and money across the whole company, with everything waiting on your decision."
        title="Admin Dashboard"
      />
      {marksOwnAttendance ? <AttendanceTodayWidget /> : null}
      {/* Org-hierarchy migration (Phase F12) — the pre-existing central
          analytics module's Super Admin dashboard, real data throughout. */}
      <PermissionGuard permission={PERMISSIONS.ANALYTICS_ADMIN}>
        <AdminDashboardContent />
      </PermissionGuard>
    </div>
  );
}

