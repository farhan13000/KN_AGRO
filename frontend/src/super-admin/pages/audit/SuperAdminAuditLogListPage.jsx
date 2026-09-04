import { AuditLogListView } from "../../../features/audit";

export default function SuperAdminAuditLogListPage() {
  return (
    <AuditLogListView
      description="Every audited state-changing action across the system, company-wide. AUDIT_READ is currently held only via the SA wildcard — no seeded role grants it directly."
      portalLabel="Org Structure"
    />
  );
}
