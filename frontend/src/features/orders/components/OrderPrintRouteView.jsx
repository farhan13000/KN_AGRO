import { useParams } from "react-router-dom";
import DocumentPrintActions from "../../../shared/components/DocumentPrintActions";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useOrderDetail } from "../hooks";
import OrderPrintView from "./OrderPrintView";

// No dedicated print endpoint exists for Orders (order.routes.js has none)
// — this reuses the same useOrderDetail fetch the regular Detail page
// uses, rather than adding a second request for data that's already
// available. Print and Download are the shared DocumentPrintActions, the
// same bar every printable document uses.
export default function OrderPrintRouteView({ backTo }) {
  const { orderId } = useParams();
  const orderState = useOrderDetail(orderId);
  const order = orderState.data?.order;

  if (orderState.isLoading) return <PageLoader message="Loading order..." />;
  if (orderState.isError) {
    return <ErrorState message={orderState.errorMessage} title="Unable to load order" />;
  }
  if (!order) {
    return (
      <EmptyState
        actionLabel="Back To Orders"
        actionTo={backTo}
        description="The selected order could not be found or is outside your allowed scope."
        title="Order not found"
      />
    );
  }

  return (
    <div>
      <DocumentPrintActions fileName={`Order ${order.orderNumber}`} />
      <OrderPrintView order={order} />
    </div>
  );
}
