import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import {
  CustomerForm,
  customerToFormValues,
  initialCustomerFormValues,
  useCustomerActions,
  useCustomerDetail,
  validateCustomerForm,
} from "../../../features/customers";

export default function SalesManagerCustomerEditPage() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const customerState = useCustomerDetail(customerId);
  const customer = customerState.data?.customer;

  const [values, setValues] = useState(initialCustomerFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (customer) setValues(customerToFormValues(customer));
  }, [customer]);

  const customerActions = useCustomerActions({
    onSuccess: () => {
      navigate(`${ROUTES.SALES_MANAGER.CUSTOMERS}/${customerId}`);
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
      await customerActions.updateCustomer.mutate(customerId, values);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  if (customerState.isLoading) return <PageLoader message="Loading customer..." />;
  if (customerState.isError) {
    return <ErrorState message={customerState.errorMessage} title="Unable to load customer" />;
  }
  if (!customer) {
    return <ErrorState message="The selected customer could not be found." title="Customer not found" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Manager CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit {customer.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Address changes here only update this Customer record — any Invoice already generated for this
          customer keeps its own frozen address snapshot from the moment it was created, and is never
          retroactively changed.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to save customer" /> : null}
      <Card className="p-5">
        <CustomerForm
          cancelPath={`${ROUTES.SALES_MANAGER.CUSTOMERS}/${customerId}`}
          errors={errors}
          isSubmitting={customerActions.updateCustomer.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          values={values}
        />
      </Card>
    </div>
  );
}
