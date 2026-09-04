import { Link, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useAuth } from "../../../core/auth";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { PERMISSIONS, ROUTES } from "../../../shared/constants";
import { PermissionGuard } from "../../../core/auth";
import { DistrictAssignmentPanel, DistrictStatusBadge, useDistrictDetail } from "../../../features/districts";
import { AuditTrailSection } from "../../../features/audit";

export default function SuperAdminDistrictDetailPage() {
  const { districtId } = useParams();
  const { hasPermission } = useAuth();
  const districtState = useDistrictDetail(districtId);
  const district = districtState.data?.district;
  const canEdit = hasPermission(PERMISSIONS.DISTRICT_UPDATE);

  if (districtState.isLoading) return <PageLoader message="Loading district..." />;
  if (districtState.isError) {
    return <ErrorState message={districtState.errorMessage} title="Unable to load district" />;
  }
  if (!district) {
    return (
      <EmptyState
        actionLabel="Back To Districts"
        actionTo={ROUTES.SUPER_ADMIN.DISTRICTS}
        description="The selected district could not be found."
        title="District not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{district.name}</h1>
          <p className="mt-2 text-sm text-muted">
            {district.code} · {district.region?.name || "No region"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DistrictStatusBadge status={district.status} />
          {canEdit ? (
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-forest ring-1 ring-forest/15 transition hover:bg-mint"
              to={ROUTES.SUPER_ADMIN.DISTRICT_EDIT.replace(":districtId", district._id)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          ) : null}
        </div>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black text-ink">District Details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Code</dt>
            <dd className="mt-1 font-mono text-sm text-ink">{district.code}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Region</dt>
            <dd className="mt-1 text-sm text-ink">{district.region?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-wide text-muted">Status</dt>
            <dd className="mt-1 text-sm text-ink">{district.status}</dd>
          </div>
        </dl>
      </Card>

      <DistrictAssignmentPanel district={district} onRefresh={districtState.refetch} />

      <PermissionGuard permission={PERMISSIONS.AUDIT_READ}>
        <AuditTrailSection entityId={districtId} entityType="District" />
      </PermissionGuard>
    </div>
  );
}
