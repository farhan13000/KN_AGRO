import { ROUTES } from "../../../shared/constants";
import { LeadDetailRouteView } from "../../../features/leads";

export default function EmployeeLeadDetailPage() {
  return (
    <LeadDetailRouteView
      backTo={ROUTES.EMPLOYEE.LEADS}
      orderDetailPathFor={(orderId) => `${ROUTES.EMPLOYEE.ORDERS}/${orderId}`}
      quotationDetailPathFor={(quotationId) => `${ROUTES.EMPLOYEE.QUOTATIONS}/${quotationId}`}
      roleLabel="Employee CRM"
    />
  );
}
