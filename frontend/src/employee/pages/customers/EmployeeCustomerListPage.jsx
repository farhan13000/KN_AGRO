import { ROUTES } from "../../../shared/constants";
import { CustomerListView } from "../../../features/customers";

// Employee holds only customers.read (confirmed in the permissions matrix)
// — no createPath is ever relevant here, and the Create button would not
// render regardless since Employee lacks customers.create.
export default function EmployeeCustomerListPage() {
  return (
    <CustomerListView
      detailPath={(customer) => `${ROUTES.EMPLOYEE.CUSTOMERS}/${customer._id}`}
      roleLabel="Employee CRM"
      subtitle="View customers with status, type, and search filters. Customer records are unscoped shared master data."
      title="Customers"
    />
  );
}
