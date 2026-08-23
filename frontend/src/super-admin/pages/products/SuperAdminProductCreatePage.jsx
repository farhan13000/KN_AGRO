import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { ROUTES } from "../../../shared/constants";
import { useCategoryList } from "../../../features/categories";
import {
  ProductForm,
  initialProductFormValues,
  pickProductPayload,
  useProductActions,
  validateProductForm,
} from "../../../features/products";

export default function SuperAdminProductCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialProductFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const categoriesState = useCategoryList({ limit: 100, status: "ACTIVE", sortBy: "name", order: "asc" });
  const categoryOptions = (categoriesState.data?.categories || []).map((category) => ({
    label: category.name,
    value: category._id,
  }));
  const productActions = useProductActions({
    onSuccess: (payload) => {
      const productId = payload?.product?._id;
      navigate(productId ? `${ROUTES.SUPER_ADMIN.PRODUCTS}/${productId}` : ROUTES.SUPER_ADMIN.PRODUCTS);
    },
  });

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateProductForm(values);
    setErrors(validation.errors);
    setFormError("");
    if (!validation.isValid) return;

    try {
      await productActions.createProduct.mutate(pickProductPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Product Catalog</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Product</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Create catalog data only. The backend initializes inventory separately with zero stock.
        </p>
      </div>
      {categoriesState.isError ? (
        <ErrorState message={categoriesState.errorMessage} title="Unable to load category options" />
      ) : null}
      {formError ? <ErrorState message={formError} title="Unable to create product" /> : null}
      <Card className="p-5">
        <ProductForm
          categoryOptions={categoryOptions}
          errors={errors}
          isSubmitting={productActions.createProduct.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Create Product"
          values={values}
        />
      </Card>
    </div>
  );
}
