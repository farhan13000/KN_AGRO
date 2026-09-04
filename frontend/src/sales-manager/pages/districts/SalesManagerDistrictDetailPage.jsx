import { useParams } from "react-router-dom";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import { DistrictAssignmentPanel, DistrictStatusBadge, useDistrictDetail } from "../../../features/districts";

export default function SalesManagerDistrictDetailPage() {
  const { districtId } = useParams();
  const districtState = useDistrictDetail(districtId);
  const district = districtState.data?.district;

  if (districtState.isLoading) return <PageLoader message="Loading district..." />;
  if (districtState.isError) {
    return <ErrorState message={districtState.errorMessage} title="Unable to load district" />;
  }
  if (!district) {
    return (
      <EmptyState
        actionLabel="Back To Districts"
        actionTo={ROUTES.SALES_MANAGER.DISTRICTS}
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
        <DistrictStatusBadge status={district.status} />
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
    </div>
  );
}
