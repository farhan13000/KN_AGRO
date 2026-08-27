import { ROUTES } from "../../../shared/constants";
import { OrderPrintRouteView } from "../../../features/orders";

export default function SalesManagerOrderPrintPage() {
  return <OrderPrintRouteView backTo={ROUTES.SALES_MANAGER.ORDERS} />;
}
