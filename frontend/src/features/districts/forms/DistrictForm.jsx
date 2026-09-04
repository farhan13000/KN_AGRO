import Button from "../../../shared/components/Button";
import TextInput from "../../../shared/forms/TextInput";
import Select from "../../../shared/forms/Select";
import { useRegionList } from "../../regions";

export default function DistrictForm({
  cancelTo,
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Save District",
  values,
}) {
  const regionsState = useRegionList({ page: 1, limit: 100, status: "ACTIVE" });
  const regions = regionsState.data?.regions || [];

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          error={errors.name}
          id="district-name"
          label="Name"
          name="name"
          onChange={onChange}
          required
          value={values.name}
        />
        <TextInput
          error={errors.code}
          id="district-code"
          label="Code"
          name="code"
          onChange={onChange}
          placeholder="e.g. NORTH-01"
          required
          value={values.code}
        />
        <Select
          error={errors.region}
          id="district-region"
          label="Region"
          name="region"
          onChange={onChange}
          options={[
            { value: "", label: regionsState.isLoading ? "Loading regions..." : "Select a region" },
            ...regions.map((region) => ({ value: region._id, label: `${region.name} (${region.code})` })),
          ]}
          required
          value={values.region}
        />
      </div>
      {regionsState.isError ? (
        <p className="text-sm font-semibold text-red-800">{regionsState.errorMessage}</p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button to={cancelTo} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
