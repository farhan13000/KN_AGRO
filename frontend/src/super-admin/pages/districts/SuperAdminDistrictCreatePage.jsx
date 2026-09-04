import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import ErrorState from "../../../shared/components/ErrorState";
import { ROUTES } from "../../../shared/constants";
import {
  DistrictForm,
  initialDistrictFormValues,
  pickDistrictPayload,
  useDistrictActions,
  validateDistrictForm,
} from "../../../features/districts";

export default function SuperAdminDistrictCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialDistrictFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const districtActions = useDistrictActions({
    onSuccess: () => navigate(ROUTES.SUPER_ADMIN.DISTRICTS),
  });

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateDistrictForm(values);
    setErrors(validation.errors);
    setFormError("");
    if (!validation.isValid) return;

    try {
      await districtActions.createDistrict.mutate(pickDistrictPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create District</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Add a district under a region. Manager assignment happens separately once it exists.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to create district" /> : null}
      <Card className="p-5">
        <DistrictForm
          cancelTo={ROUTES.SUPER_ADMIN.DISTRICTS}
          errors={errors}
          isSubmitting={districtActions.createDistrict.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Create District"
          values={values}
        />
      </Card>
    </div>
  );
}
