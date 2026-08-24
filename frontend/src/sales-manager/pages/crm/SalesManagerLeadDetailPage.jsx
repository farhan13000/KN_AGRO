import { ROUTES } from "../../../shared/constants";
import { LeadDetailRouteView } from "../../../features/leads";

export default function SalesManagerLeadDetailPage() {
  return <LeadDetailRouteView backTo={ROUTES.SALES_MANAGER.LEADS} roleLabel="Manager CRM" />;
}
