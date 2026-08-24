import { ROUTES } from "../../../shared/constants";
import { LeadPipelineView } from "../../../features/leads";

export default function SalesManagerCrmPipelinePage() {
  return (
    <LeadPipelineView
      detailPath={(lead) => `${ROUTES.SALES_MANAGER.LEADS}/${lead._id}`}
      roleLabel="Manager CRM"
      title="CRM Pipeline"
    />
  );
}
