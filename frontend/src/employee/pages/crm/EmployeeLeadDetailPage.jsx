import { ROUTES } from "../../../shared/constants";
import { LeadDetailRouteView } from "../../../features/leads";

export default function EmployeeLeadDetailPage() {
  return <LeadDetailRouteView backTo={ROUTES.EMPLOYEE.LEADS} roleLabel="Employee CRM" />;
}
