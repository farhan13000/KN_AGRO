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
  pipelineValueFromProducts,
  useLeadActions,
  validateLeadForm,
} from "../../../features/leads";

export default function SalesManagerLeadCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialLeadFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const productsState = useProductList({ limit: 100, status: "ACTIVE", sortBy: "name", sortOrder: "asc" });
  const productOptions = (productsState.data?.products || []).map((product) => ({
    label: [product.productCode, product.name].filter(Boolean).join(" - "),
    value: product._id,
    // What the pipeline value is worked out from: the catalogue price the
    // Super Admin / Office Admin set, and the product's own tax rate.
    price: product.sellingPrice,
    taxRate: product.taxRate,
    unit: product.unit,
  }));
  const leadActions = useLeadActions({
    onSuccess: (payload) => {
      const leadId = payload?.lead?._id;
      navigate(leadId ? `${ROUTES.SALES_MANAGER.LEADS}/${leadId}` : ROUTES.SALES_MANAGER.LEADS);
    },
  });

  // Clearing the banner on ANY edit, not only on the next submit. The
  // banner reports what the server said about the LAST attempt; leaving
  // it up while the person fixes exactly what it complained about reads
  // as "I fixed it and it still says no", which is what it did say.
  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
    setFormError("");
  };

  // Picking products, or changing a quantity, re-states the pipeline
  // value from the catalogue and overwrites whatever was there: the
  // products and their quantities are what the figure MEANS, so a stale
  // number from an earlier selection would be wrong. It stays editable
  // afterwards — see pipelineValueFromProducts.
  const handleProductChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setValues((current) => {
      // Drop quantities for products no longer selected, so a figure can
      // never include something the lead is not interested in.
      const quantities = Object.fromEntries(
        Object.entries(current.productQuantities || {}).filter(([id]) => selected.includes(id)),
      );
      return {
        ...current,
        interestedProducts: selected,
        productQuantities: quantities,
        expectedValue: pipelineValueFromProducts(selected, productOptions, quantities),
      };
    });
    setErrors((current) => ({ ...current, expectedValue: "", productQuantities: "" }));
    setFormError("");
  };

  const handleQuantityChange = (productId, quantity) => {
    setErrors((current) => ({ ...current, productQuantities: "" }));
    setFormError("");
    setValues((current) => {
      const quantities = { ...(current.productQuantities || {}) };
      if (String(quantity).trim() === "") delete quantities[String(productId)];
      else quantities[String(productId)] = quantity;
      return {
        ...current,
        productQuantities: quantities,
        expectedValue: pipelineValueFromProducts(current.interestedProducts, productOptions, quantities),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateLeadForm(values);
    setErrors(validation.errors);
    setFormError("");
    if (!validation.isValid) return;

    try {
      // Raw form values, NOT a pre-built payload: leadApi.createLead
      // builds it. Doing it here as well ran the builder twice, and the
      // second pass was handed its own output — which quietly dropped
      // every product quantity, because they leave here as an array and
      // the builder expects the form's map.
      await leadActions.createLead.mutate(values);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Manager CRM</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Lead</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Add a lead your team has found. The lead code, its starting status and who it belongs to are set for
          you.
        </p>
      </div>
      {productsState.isError ? (
        <ErrorState message={productsState.errorMessage} title="Unable to load product options" />
      ) : null}
      {formError ? <ErrorState message={formError} title="Unable to create lead" /> : null}
      <Card className="p-5">
        <LeadForm
          cancelTo={ROUTES.SALES_MANAGER.LEADS}
          errors={errors}
          isSubmitting={leadActions.createLead.isLoading}
          onChange={handleChange}
          onProductChange={handleProductChange}
          onQuantityChange={handleQuantityChange}
          onSubmit={handleSubmit}
          productOptions={productOptions}
          submitLabel="Create Lead"
          values={values}
        />
      </Card>
    </div>
  );
}
