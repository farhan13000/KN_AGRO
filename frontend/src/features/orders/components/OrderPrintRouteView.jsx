import { Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useOrderDetail } from "../hooks";
import OrderPrintView from "./OrderPrintView";

// No dedicated print endpoint exists for Orders (order.routes.js has none)
// — this reuses the same useOrderDetail fetch the regular Detail page
// uses, rather than adding a second request for data that's already
// available. Prompt 56 (PDF boundary): same window.print()-only decision
// as Quotations/Invoices, no PDF library.
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
      <div className="mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()} variant="secondary">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
      <OrderPrintView order={order} />
    </div>
  );
}
