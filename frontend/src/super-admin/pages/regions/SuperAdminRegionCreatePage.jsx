import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { ROUTES } from "../../../shared/constants";
import {
  RegionForm,
  initialRegionFormValues,
  pickRegionPayload,
  useRegionActions,
  validateRegionForm,
} from "../../../features/regions";

export default function SuperAdminRegionCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialRegionFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const regionActions = useRegionActions({
    onSuccess: () => navigate(ROUTES.SUPER_ADMIN.REGIONS),
  });

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateRegionForm(values);
    setErrors(validation.errors);
    setFormError("");
    if (!validation.isValid) return;

    try {
      await regionActions.createRegion.mutate(pickRegionPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create Region</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Add a new geography for districts and employees to be assigned under.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to create region" /> : null}
      <Card className="p-5">
        <RegionForm
          cancelTo={ROUTES.SUPER_ADMIN.REGIONS}
          errors={errors}
          isSubmitting={regionActions.createRegion.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Create Region"
          values={values}
        />
      </Card>
    </div>
  );
}
