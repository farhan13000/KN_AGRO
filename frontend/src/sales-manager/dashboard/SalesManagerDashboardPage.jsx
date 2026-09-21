import DashboardShell from "../../shared/components/DashboardShell";
import { useAuth } from "../../core/auth";
import { PermissionGuard } from "../../core/auth";
import { PERMISSIONS } from "../../shared/constants";
import { OrderAttributionWidget } from "../../features/orders";
import { ManagerDashboardContent, SalesOfficerDashboardContent } from "../../features/analytics";
import { AttendanceTodayWidget } from "../../features/attendance";
import { SalesTargetProgressCard, TeamTargetProgressCard } from "../../features/salesTargets";

/**
 * GM/RM/ASM/legacy SALES_MANAGER (all hold ANALYTICS_MANAGER) get the full
 * Manager Dashboard; SO (holds ANALYTICS_EMPLOYEE instead — the backend's
 * own deliberate "SO doesn't fit either tier cleanly" design, see
 * dashboard.service.js#getSalesOfficerDashboard) gets the lighter SO
 * Dashboard. Branching on which permission is held (not on role directly)
 * — this is the doc's own explicitly-allowed exception ("role -> section
 * list is a display-shape decision, not access control"), and permission-
 * based here stays consistent with every other check in this component.
 */
export default function SalesManagerDashboardPage() {
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-6">
      <DashboardShell
        description="Your team's leads, sales, attendance and reports, with the approvals waiting on you."
        title="Manager Dashboard"
      />
      {/* Org-hierarchy migration (Phase F09) — sales attribution rollup by
          tier, complementary to (not replaced by) Phase F12's fuller
          dashboard below. */}
      <PermissionGuard permission={PERMISSIONS.ORDERS_ANALYTICS_READ}>
        <OrderAttributionWidget />
      </PermissionGuard>
      {/* Org-hierarchy migration (Phase F17) — real check-in/check-out for
          every manager-tier role (all hold ATTENDANCE_CHECK_IN). */}
      <PermissionGuard permission={PERMISSIONS.ATTENDANCE_CHECK_IN}>
        <AttendanceTodayWidget />
        <SalesTargetProgressCard />
        <TeamTargetProgressCard />
      </PermissionGuard>
      {hasPermission(PERMISSIONS.ANALYTICS_MANAGER) ? (
        <ManagerDashboardContent />
      ) : hasPermission(PERMISSIONS.ANALYTICS_EMPLOYEE) ? (
        <SalesOfficerDashboardContent />
      ) : null}
    </div>
  );
}

