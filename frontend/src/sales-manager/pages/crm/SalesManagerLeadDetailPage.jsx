import { ROUTES } from "../../../shared/constants";
import { LeadDetailRouteView } from "../../../features/leads";

export default function SalesManagerLeadDetailPage() {
  return (
    <LeadDetailRouteView
      backTo={ROUTES.SALES_MANAGER.LEADS}
      quotationCreatePath={ROUTES.SALES_MANAGER.QUOTATION_CREATE}
      quotationDetailPathFor={(quotationId) => `${ROUTES.SALES_MANAGER.QUOTATIONS}/${quotationId}`}
      roleLabel="Manager CRM"
    />
  );
}
