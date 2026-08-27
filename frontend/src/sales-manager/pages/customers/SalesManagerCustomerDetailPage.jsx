import { ROUTES } from "../../../shared/constants";
import { CustomerDetailRouteView } from "../../../features/customers";

export default function SalesManagerCustomerDetailPage() {
  return (
    <CustomerDetailRouteView
      backTo={ROUTES.SALES_MANAGER.CUSTOMERS}
      editPathFor={(customer) => `${ROUTES.SALES_MANAGER.CUSTOMERS}/${customer._id}/edit`}
      leadDetailPathFor={(lead) => `${ROUTES.SALES_MANAGER.LEADS}/${lead._id}`}
      roleLabel="Manager CRM"
    />
  );
}
