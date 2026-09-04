import DashboardShell from "../../shared/components/DashboardShell";
import { PermissionGuard } from "../../core/auth";
import { PERMISSIONS } from "../../shared/constants";
import { AdminDashboardContent } from "../../features/analytics";

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardShell
        description="System-wide control starts here. Authentication, routing, and the protected shell are in place before full management modules are added."
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

