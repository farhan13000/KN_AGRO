import { ROUTES } from "../../../shared/constants";
import { LeadDetailRouteView } from "../../../features/leads";

export default function SuperAdminLeadDetailPage() {
  return <LeadDetailRouteView backTo={ROUTES.SUPER_ADMIN.LEADS} roleLabel="CRM" />;
}
