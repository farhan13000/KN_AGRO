import Button from "../../../shared/components/Button";
import TextInput from "../../../shared/forms/TextInput";
import Textarea from "../../../shared/forms/Textarea";
import { ROUTES } from "../../../shared/constants";

export default function CategoryForm({
  errors = {},
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = "Save Category",
  values,
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          error={errors.name}
          id="category-name"
          label="Name"
          name="name"
          onChange={onChange}
          required
          value={values.name}
        />
        <TextInput
          error={errors.slug}
          id="category-slug"
          label="Slug"
          name="slug"
          onChange={onChange}
          placeholder="Optional; backend normalizes it"
          value={values.slug}
        />
        <TextInput
          error={errors.image}
          id="category-image"
          label="Image URL"
          name="image"
          onChange={onChange}
          type="url"
          value={values.image}
        />
        <TextInput
          error={errors.sortOrder}
          id="category-sort-order"
          label="Sort Order"
          min="0"
          name="sortOrder"
          onChange={onChange}
          type="number"
          value={values.sortOrder}
        />
        <div className="sm:col-span-2">
          <Textarea
            error={errors.description}
            id="category-description"
            label="Description"
            maxLength={1000}
            name="description"
            onChange={onChange}
            value={values.description}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button to={ROUTES.SUPER_ADMIN.CATEGORIES} variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
