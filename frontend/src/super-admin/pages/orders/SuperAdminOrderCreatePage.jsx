import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import { ROUTES } from "../../../shared/constants";
import { useLeadDetail } from "../../../features/leads";
import { OrderBuilder, useOrderActions } from "../../../features/orders";

export default function SuperAdminOrderCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Arriving from a lead pre-selects (and locks) the customer; arriving
  // from the Orders list leaves the picker open.
  const leadId = searchParams.get("leadId") || "";
  const leadState = useLeadDetail(leadId);
  const [submitError, setSubmitError] = useState("");

  const actions = useOrderActions({
    onSuccess: (payload) => {
      const orderId = payload?.order?._id;
      navigate(orderId ? `${ROUTES.SUPER_ADMIN.ORDERS}/${orderId}` : ROUTES.SUPER_ADMIN.ORDERS);
    },
  });

  const handleSubmit = async (values) => {
    setSubmitError("");
    try {
      await actions.createDirectOrder.mutate(values);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Take Order</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Record an order the customer has already agreed to. Prices and totals are recalculated by the
          backend on save; a manager confirms and bills it afterwards.
        </p>
      </div>

      <OrderBuilder
        initialLead={leadId ? leadState.data?.lead ?? null : null}
        isSubmitting={actions.createDirectOrder.isLoading}
        onSubmit={handleSubmit}
        submitError={submitError}
      />
    </div>
  );
}
