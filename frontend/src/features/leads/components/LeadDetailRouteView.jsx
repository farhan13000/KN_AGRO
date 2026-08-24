import { useParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useLeadActivityTimeline } from "../../lead-activities/hooks";
import { useLeadDetail } from "../hooks";
import LeadDetailView from "./LeadDetailView";

export default function LeadDetailRouteView({ backTo, roleLabel = "CRM" }) {
  const { leadId } = useParams();
  const leadState = useLeadDetail(leadId);
  const timelineState = useLeadActivityTimeline(leadId, { limit: 20 });
  const lead = leadState.data?.lead;
  const recentActivities = leadState.data?.recentActivities || [];

  const refetchLeadAndTimeline = async () => {
    leadState.refetch();
    timelineState.refetch();
  };

  if (leadState.isLoading) return <PageLoader message="Loading lead..." />;
  if (leadState.isError) {
    return <ErrorState message={leadState.errorMessage} title="Unable to load lead" />;
  }
  if (!lead) {
    return (
      <EmptyState
        actionLabel="Back To Leads"
        actionTo={backTo}
        description="The selected lead could not be found or is outside your allowed scope."
        title="Lead not found"
      />
    );
  }

  return (
    <LeadDetailView
      lead={lead}
      onMutationSuccess={refetchLeadAndTimeline}
      recentActivities={recentActivities}
      roleLabel={roleLabel}
      timelineState={timelineState}
    />
  );
}
