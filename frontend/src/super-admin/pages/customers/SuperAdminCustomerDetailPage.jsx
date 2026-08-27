import { ROUTES } from "../../../shared/constants";
import { CustomerDetailRouteView } from "../../../features/customers";

export default function SuperAdminCustomerDetailPage() {
  return (
    <CustomerDetailRouteView
      backTo={ROUTES.SUPER_ADMIN.CUSTOMERS}
      editPathFor={(customer) => `${ROUTES.SUPER_ADMIN.CUSTOMERS}/${customer._id}/edit`}
      leadDetailPathFor={(lead) => `${ROUTES.SUPER_ADMIN.LEADS}/${lead._id}`}
      roleLabel="CRM"
    />
  );
}
