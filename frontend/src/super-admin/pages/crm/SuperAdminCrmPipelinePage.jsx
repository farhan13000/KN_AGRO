import { ROUTES } from "../../../shared/constants";
import { LeadPipelineView } from "../../../features/leads";

export default function SuperAdminCrmPipelinePage({ showHeading = true }) {
  return (
    <LeadPipelineView
      detailPath={(lead) => `${ROUTES.SUPER_ADMIN.LEADS}/${lead._id}`}
      roleLabel="CRM"
      showHeading={showHeading}
      title="CRM Pipeline"
    />
  );
}
