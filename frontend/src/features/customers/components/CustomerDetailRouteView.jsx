import { useParams } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { useCustomerDetail, useCustomerHistory } from "../hooks";
import CustomerDetailView from "./CustomerDetailView";

export default function CustomerDetailRouteView({ backTo, editPathFor, leadDetailPathFor, roleLabel = "CRM" }) {
  const { customerId } = useParams();
  const customerState = useCustomerDetail(customerId);
  // Fetched in parallel, not gated behind customerState resolving first —
  // this is the actual "lazy" load: Activity has its own independent
  // loading state inside CustomerHistoryPanel, so a slow history fetch
  // never blocks Identity/Contact/Address from rendering.
  const historyState = useCustomerHistory(customerId);
  const customer = customerState.data?.customer;

  if (customerState.isLoading) return <PageLoader message="Loading customer..." />;
  if (customerState.isError) {
    return <ErrorState message={customerState.errorMessage} title="Unable to load customer" />;
  }
  if (!customer) {
    return (
      <EmptyState
        actionLabel="Back To Customers"
        actionTo={backTo}
        description="The selected customer could not be found."
        title="Customer not found"
      />
    );
  }

  return (
    <CustomerDetailView
      customer={customer}
      editPath={editPathFor ? editPathFor(customer) : ""}
      historyState={historyState}
      leadDetailPath={leadDetailPathFor}
      roleLabel={roleLabel}
    />
  );
}
