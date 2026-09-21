import { ROUTES } from "../../../shared/constants";
import { CustomerListView } from "../../../features/customers";

export default function SuperAdminCustomerListPage() {
  return (
    <CustomerListView
      createPath={ROUTES.SUPER_ADMIN.CUSTOMER_CREATE}
      detailPath={(customer) => `${ROUTES.SUPER_ADMIN.CUSTOMERS}/${customer._id}`}
      roleLabel="CRM"
      subtitle="Customers with status, type and search filters. The customer list is shared by the whole company."
      title="Customers"
    />
  );
}
