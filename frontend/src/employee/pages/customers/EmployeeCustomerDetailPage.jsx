import { ROUTES } from "../../../shared/constants";
import { CustomerDetailRouteView } from "../../../features/customers";

export default function EmployeeCustomerDetailPage() {
  return (
    <CustomerDetailRouteView
      backTo={ROUTES.EMPLOYEE.CUSTOMERS}
      leadDetailPathFor={(lead) => `${ROUTES.EMPLOYEE.LEADS}/${lead._id}`}
      roleLabel="Employee CRM"
    />
  );
}
