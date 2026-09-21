import DashboardShell from "../../shared/components/DashboardShell";
import { PermissionGuard } from "../../core/auth";
import { PERMISSIONS } from "../../shared/constants";
import { AdminDashboardContent } from "../../features/analytics";

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardShell
        description="Sales, stock, staff and money across the whole company, with everything waiting on your decision."
        title="Admin Dashboard"
      />
      {/* Org-hierarchy migration (Phase F12) — the pre-existing central
          analytics module's Super Admin dashboard, real data throughout. */}
      <PermissionGuard permission={PERMISSIONS.ANALYTICS_ADMIN}>
        <AdminDashboardContent />
      </PermissionGuard>
    </div>
  );
}

