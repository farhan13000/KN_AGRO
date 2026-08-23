import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { ROUTES } from "../../../shared/constants";
import {
  CategoryForm,
  initialCategoryFormValues,
  pickCategoryPayload,
  useCategoryActions,
  validateCategoryForm,
} from "../../../features/categories";

export default function SuperAdminCategoryCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialCategoryFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const categoryActions = useCategoryActions({
    onSuccess: () => navigate(ROUTES.SUPER_ADMIN.CATEGORIES),
  });

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
      await categoryActions.createCategory.mutate(pickCategoryPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Catalog Setup</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Category</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Add a backend-backed category. Public visibility remains controlled through category status.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to create category" /> : null}
      <Card className="p-5">
        <CategoryForm
          errors={errors}
          isSubmitting={categoryActions.createCategory.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Create Category"
          values={values}
        />
      </Card>
    </div>
  );
}
