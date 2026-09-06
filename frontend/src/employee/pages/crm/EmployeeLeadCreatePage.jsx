import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { ROUTES } from "../../../shared/constants";
import { useProductList } from "../../../features/products";
import {
  LeadForm,
  initialLeadFormValues,
  pickCreateLeadPayload,
  useLeadActions,
  validateLeadForm,
} from "../../../features/leads";

export default function EmployeeLeadCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialLeadFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const productsState = useProductList({ limit: 100, status: "ACTIVE", sortBy: "name", sortOrder: "asc" });
  const productOptions = (productsState.data?.products || []).map((product) => ({
    label: [product.productCode, product.name].filter(Boolean).join(" - "),
    value: product._id,
  }));
  const leadActions = useLeadActions({
    onSuccess: (payload) => {
      const leadId = payload?.lead?._id;
      navigate(leadId ? `${ROUTES.EMPLOYEE.LEADS}/${leadId}` : ROUTES.EMPLOYEE.LEADS);
    },
  });

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  const handleProductChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setValues((current) => ({ ...current, interestedProducts: selected }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateLeadForm(values);
    setErrors(validation.errors);
    setFormError("");
    if (!validation.isValid) return;

    try {
      await leadActions.createLead.mutate(pickCreateLeadPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Employee CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Lead</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Capture a lead you have met in the field. Backend services remain responsible for status, lead code,
          ownership rules, and history.
        </p>
      </div>
      {productsState.isError ? (
        <ErrorState message={productsState.errorMessage} title="Unable to load product options" />
      ) : null}
      {formError ? <ErrorState message={formError} title="Unable to create lead" /> : null}
      <Card className="p-5">
        <LeadForm
          cancelTo={ROUTES.EMPLOYEE.LEADS}
          errors={errors}
          isSubmitting={leadActions.createLead.isLoading}
          onChange={handleChange}
          onProductChange={handleProductChange}
          onSubmit={handleSubmit}
          productOptions={productOptions}
          submitLabel="Create Lead"
          values={values}
        />
      </Card>
    </div>
  );
}
