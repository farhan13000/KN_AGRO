import Button from "../../../shared/components/Button";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";

export default function RegionForm({
  cancelTo,
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Save Region",
  values,
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          error={errors.name}
          id="region-name"
          label="Name"
          name="name"
          onChange={onChange}
          required
          value={values.name}
        />
        <TextInput
          error={errors.code}
          id="region-code"
          label="Code"
          name="code"
          onChange={onChange}
          placeholder="e.g. NORTH"
          required
          value={values.code}
        />
        <div className="sm:col-span-2">
          <Textarea
            error={errors.description}
            id="region-description"
            label="Description"
            maxLength={1000}
            name="description"
            onChange={onChange}
            value={values.description}
          />
        </div>
      </div>
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
