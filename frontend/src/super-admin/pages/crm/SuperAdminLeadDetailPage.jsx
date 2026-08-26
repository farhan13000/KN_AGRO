import { ROUTES } from "../../../shared/constants";
import { LeadDetailRouteView } from "../../../features/leads";

export default function SuperAdminLeadDetailPage() {
  return (
    <LeadDetailRouteView
      backTo={ROUTES.SUPER_ADMIN.LEADS}
      quotationCreatePath={ROUTES.SUPER_ADMIN.QUOTATION_CREATE}
      quotationDetailPathFor={(quotationId) => `${ROUTES.SUPER_ADMIN.QUOTATIONS}/${quotationId}`}
      roleLabel="CRM"
    />
  );
}
