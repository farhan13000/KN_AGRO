import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import {
  DistrictForm,
  districtToFormValues,
  initialDistrictFormValues,
  pickDistrictPayload,
  useDistrictActions,
  useDistrictDetail,
  validateDistrictForm,
} from "../../../features/districts";

export default function SuperAdminDistrictEditPage() {
  const navigate = useNavigate();
  const { districtId } = useParams();
  const districtState = useDistrictDetail(districtId);
  const district = districtState.data?.district;
  const [hydratedDistrictId, setHydratedDistrictId] = useState("");
  const [values, setValues] = useState(initialDistrictFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const districtActions = useDistrictActions({
    onSuccess: () => navigate(ROUTES.SUPER_ADMIN.DISTRICTS),
  });

  useEffect(() => {
    if (district?._id && district._id !== hydratedDistrictId) {
      setValues(districtToFormValues(district));
      setHydratedDistrictId(district._id);
    }
  }, [district, hydratedDistrictId]);

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
      await districtActions.updateDistrict.mutate(districtId, pickDistrictPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  if (districtState.isLoading) return <PageLoader message="Loading district..." />;
  if (districtState.isError) {
    return <ErrorState message={districtState.errorMessage} title="Unable to load district" />;
  }
  if (!district) {
    return (
      <EmptyState
        actionLabel="Back To Districts"
        actionTo={ROUTES.SUPER_ADMIN.DISTRICTS}
        description="The selected district could not be found."
        title="District not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit District</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Update district naming and its parent region.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to update district" /> : null}
      <Card className="p-5">
        <DistrictForm
          cancelTo={ROUTES.SUPER_ADMIN.DISTRICTS}
          errors={errors}
          isSubmitting={districtActions.updateDistrict.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Update District"
          values={values}
        />
      </Card>
    </div>
  );
}
