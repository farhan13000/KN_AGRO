import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { ROUTES } from "../../../shared/constants";
import {
  CustomerForm,
  initialCustomerFormValues,
  useCustomerActions,
  validateCustomerForm,
} from "../../../features/customers";

export default function SuperAdminCustomerCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialCustomerFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const customerActions = useCustomerActions({
    onSuccess: (payload) => {
      const customerId = payload?.customer?._id;
      navigate(customerId ? `${ROUTES.SUPER_ADMIN.CUSTOMERS}/${customerId}` : ROUTES.SUPER_ADMIN.CUSTOMERS);
    },
  });

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateCustomerForm(values);
    setErrors(validation.errors);
    setFormError("");
    if (!validation.isValid) return;

    try {
      await customerActions.createCustomer.mutate(values);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Customer</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Create a new customer record. This never auto-merges with an existing customer — a duplicate
          phone/email match is rejected by the backend rather than silently combined.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to create customer" /> : null}
      <Card className="p-5">
        <CustomerForm
          cancelPath={ROUTES.SUPER_ADMIN.CUSTOMERS}
          errors={errors}
          isSubmitting={customerActions.createCustomer.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Create Customer"
          values={values}
        />
      </Card>
    </div>
  );
}
