import { ROUTES } from "../../../shared/constants";
import { OrderPrintRouteView } from "../../../features/orders";

export default function EmployeeOrderPrintPage() {
  return <OrderPrintRouteView backTo={ROUTES.EMPLOYEE.ORDERS} />;
}
