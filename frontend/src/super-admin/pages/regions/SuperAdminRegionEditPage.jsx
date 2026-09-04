import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../core/api";
import Card from "../../../shared/components/Card";
import EmptyState from "../../../shared/components/EmptyState";
import ErrorState from "../../../shared/components/ErrorState";
import PageLoader from "../../../shared/components/PageLoader";
import { ROUTES } from "../../../shared/constants";
import {
  RegionForm,
  initialRegionFormValues,
  pickRegionPayload,
  regionToFormValues,
  useRegionActions,
  useRegionDetail,
  validateRegionForm,
} from "../../../features/regions";

export default function SuperAdminRegionEditPage() {
  const navigate = useNavigate();
  const { regionId } = useParams();
  const regionState = useRegionDetail(regionId);
  const region = regionState.data?.region;
  const [hydratedRegionId, setHydratedRegionId] = useState("");
  const [values, setValues] = useState(initialRegionFormValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const regionActions = useRegionActions({
    onSuccess: () => navigate(ROUTES.SUPER_ADMIN.REGIONS),
  });

  useEffect(() => {
    if (region?._id && region._id !== hydratedRegionId) {
      setValues(regionToFormValues(region));
      setHydratedRegionId(region._id);
    }
  }, [region, hydratedRegionId]);

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
      await regionActions.updateRegion.mutate(regionId, pickRegionPayload(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  if (regionState.isLoading) return <PageLoader message="Loading region..." />;
  if (regionState.isError) {
    return <ErrorState message={regionState.errorMessage} title="Unable to load region" />;
  }
  if (!region) {
    return (
      <EmptyState
        actionLabel="Back To Regions"
        actionTo={ROUTES.SUPER_ADMIN.REGIONS}
        description="The selected region could not be found."
        title="Region not found"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-agriculture">Org Structure</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Edit Region</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Update region naming and description.
        </p>
      </div>
      {formError ? <ErrorState message={formError} title="Unable to update region" /> : null}
      <Card className="p-5">
        <RegionForm
          cancelTo={ROUTES.SUPER_ADMIN.REGIONS}
          errors={errors}
          isSubmitting={regionActions.updateRegion.isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Update Region"
          values={values}
        />
      </Card>
    </div>
  );
}
