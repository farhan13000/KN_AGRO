import { ROUTES } from "../../../shared/constants";
import { OrderPrintRouteView } from "../../../features/orders";

export default function SuperAdminOrderPrintPage() {
  return <OrderPrintRouteView backTo={ROUTES.SUPER_ADMIN.ORDERS} />;
}
