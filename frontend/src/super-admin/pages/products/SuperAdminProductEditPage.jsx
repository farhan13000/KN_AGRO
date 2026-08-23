import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import { useCategoryList } from "../../../features/categories";
import {
  ProductForm,
  initialProductFormValues,
  pickProductPayload,
  productToFormValues,
  useProductActions,
  useProductDetail,
  validateProductForm,
} from "../../../features/products";

export default function SuperAdminProductEditPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const productState = useProductDetail(productId);
  const categoriesState = useCategoryList({ limit: 100, sortBy: "name", order: "asc" });
  const product = productState.data?.product;
  const [hydratedProductId, setHydratedProductId] = useState("");
  const [values, setValues] = useState(initialProductFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const categoryOptions = (categoriesState.data?.categories || []).map((category) => ({
    label: category.name,
    value: category._id,
  }));
  const productActions = useProductActions({
    onSuccess: () => navigate(`${ROUTES.SUPER_ADMIN.PRODUCTS}/${productId}`),
  });

  useEffect(() => {
    if (product?._id && product._id !== hydratedProductId) {
      setValues(productToFormValues(product));
      setHydratedProductId(product._id);
    }
  }, [hydratedProductId, product]);

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
      await productActions.updateProduct.mutate(productId, pickProductPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  if (productState.isLoading) return <PageLoader message="Loading product..." />;
  if (productState.isError) {
    return <ErrorState message={productState.errorMessage} title="Unable to load product" />;
  }
  if (!product) {
    return (
      <EmptyState
        actionLabel="Back To Products"
        actionTo={ROUTES.SUPER_ADMIN.PRODUCTS}
        description="The selected product could not be found."
        title="Product not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Product Catalog</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit Product</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Update product catalog fields while keeping stock movement changes inside inventory workflows.
        </p>
      </div>
      {categoriesState.isError ? (
        <ErrorState message={categoriesState.errorMessage} title="Unable to load category options" />
      ) : null}
      {formError ? <ErrorState message={formError} title="Unable to update product" /> : null}
      <Card className="p-5">
        <ProductForm
          categoryOptions={categoryOptions}
          errors={errors}
          isSubmitting={productActions.updateProduct.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Update Product"
          values={values}
        />
      </Card>
    </div>
  );
}
