import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import {
  CategoryForm,
  categoryToFormValues,
  initialCategoryFormValues,
  pickCategoryPayload,
  useCategoryActions,
  useCategoryDetail,
  validateCategoryForm,
} from "../../../features/categories";

export default function SuperAdminCategoryEditPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const categoryState = useCategoryDetail(categoryId);
  const category = categoryState.data?.category;
  const [hydratedCategoryId, setHydratedCategoryId] = useState("");
  const [values, setValues] = useState(initialCategoryFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const categoryActions = useCategoryActions({
    onSuccess: () => navigate(ROUTES.SUPER_ADMIN.CATEGORIES),
  });

  useEffect(() => {
    if (category?._id && category._id !== hydratedCategoryId) {
      setValues(categoryToFormValues(category));
      setHydratedCategoryId(category._id);
    }
  }, [category, hydratedCategoryId]);

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateCategoryForm(values);
    setErrors(validation.errors);
    setFormError("");
    if (!validation.isValid) return;

    try {
      await categoryActions.updateCategory.mutate(categoryId, pickCategoryPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  if (categoryState.isLoading) return <PageLoader message="Loading category..." />;
  if (categoryState.isError) {
    return <ErrorState message={categoryState.errorMessage} title="Unable to load category" />;
  }
  if (!category) {
    return (
      <EmptyState
        actionLabel="Back To Categories"
        actionTo={ROUTES.SUPER_ADMIN.CATEGORIES}
        description="The selected category could not be found."
        title="Category not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Catalog Setup</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit Category</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Update category naming, image, description, and sort order without bypassing backend validation.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to update category" /> : null}
      <Card className="p-5">
        <CategoryForm
          errors={errors}
          isSubmitting={categoryActions.updateCategory.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Update Category"
          values={values}
        />
      </Card>
    </div>
  );
}
