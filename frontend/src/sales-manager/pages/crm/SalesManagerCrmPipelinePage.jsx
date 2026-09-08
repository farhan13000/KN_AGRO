import { ROUTES } from "../../../shared/constants";
import { LeadPipelineView } from "../../../features/leads";

export default function SalesManagerCrmPipelinePage({ showHeading = true }) {
  return (
    <LeadPipelineView
      detailPath={(lead) => `${ROUTES.SALES_MANAGER.LEADS}/${lead._id}`}
      roleLabel="Manager CRM"
      showHeading={showHeading}
      title="CRM Pipeline"
    />
  );
}
